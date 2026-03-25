from datetime import date, timedelta

from flask import Blueprint, current_app, jsonify, request
from flask_login import current_user, login_required
from sqlalchemy import func, select, case
from sqlalchemy.orm import joinedload

from app.extensions import db
from app.models import Machine, User, WorkOrder, WorkOrderEvent
from app.models.enums import EventEnum, StatusEnum

read_bp = Blueprint("read", __name__)


def _parse_iso_date(value: str | None):
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def _parse_bool(value: str | None) -> bool:
    if value is None:
        return False
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _build_machine_payload(machine: Machine, latest_work_order: WorkOrder | None, include_machine_notes: bool = False):
    payload = machine.serialize(include_notes=include_machine_notes)
    payload["latest_work_order"] = latest_work_order.serialize() if latest_work_order else None
    return payload


# --------------------
#    USER QUERY
# --------------------
@read_bp.get("/user/<int:id>")
def get_user(id):
    try:
        user = db.session.get(User, id)
        if not user:
            return jsonify(success=False, message=f"User with id {id} not found"), 404
        return jsonify(success=True, user=user.serialize()), 200
    except Exception as e:
        current_app.logger.error(f"[USER QUERY ERROR]: {e}")
        return jsonify(success=False, message=f"There was an error when querying for user {id}"), 500


@read_bp.get("/users")
def get_users():
    try:
        users = db.session.query(User).order_by(User.first_name.asc(), User.last_name.asc()).all()
        return jsonify(success=True, users=[u.serialize() for u in users]), 200
    except Exception as e:
        current_app.logger.error(f"[USER QUERY ERROR]: {e}")
        return jsonify(success=False, message="Something went wrong when querying for users"), 500


# --------------------
#    MACHINE QUERY
# --------------------
@read_bp.get("/machine/<int:id>")
def get_machine(id):
    try:
        machine = (
            db.session.query(Machine)
            .options(joinedload(Machine.work_orders))
            .filter(Machine.id == id)
            .first()
        )
        if not machine:
            return jsonify(success=False, message=f"Machine with id {id} not found"), 404

        latest_work_order = None
        if machine.work_orders:
            latest_work_order = max(machine.work_orders, key=lambda wo: wo.id)

        return jsonify(success=True, machine=_build_machine_payload(machine, latest_work_order, include_machine_notes=True)), 200
    except Exception as e:
        current_app.logger.error(f"[MACHINE QUERY ERROR]: {e}")
        return jsonify(success=False, message=f"Something went wrong when querying for machine with id {id}"), 500


@read_bp.get("/machines")
def get_machines():
    try:
        user_id = request.args.get("user_id", type=int)
        status_raw = (request.args.get("status") or "").strip().lower()
        stale_only = _parse_bool(request.args.get("stale_only"))
        stale_days = request.args.get("stale_days", 3, type=int)
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 8, type=int)

        if stale_days is None or stale_days < 1:
            return jsonify(success=False, message="stale_days must be a positive integer"), 400

        status = None
        if status_raw:
            try:
                status = StatusEnum(status_raw)
            except ValueError:
                return jsonify(success=False, message="Invalid status filter"), 400

        stale_cutoff_date = None
        if stale_only:
            if status and status != StatusEnum.IN_PROGRESS:
                return jsonify(success=False, message="stale_only can only be used with in_progress status"), 400
            status = StatusEnum.IN_PROGRESS
            stale_cutoff_date = date.today() - timedelta(days=stale_days)

        latest_work_order_id = (
            select(func.max(WorkOrder.id))
            .where(WorkOrder.machine_id == Machine.id)
            .correlate(Machine)
            .scalar_subquery()
        )

        query = (
            db.session.query(Machine, WorkOrder)
            .outerjoin(WorkOrder, WorkOrder.id == latest_work_order_id)
            .order_by(
                case((WorkOrder.id.is_(None), 1), else_=0),
                WorkOrder.id.desc(),
                Machine.id.desc(),
            )
        )

        if user_id:
            query = query.filter(WorkOrder.initiated_by == user_id)

        if status:
            query = query.filter(WorkOrder.current_status == status)

        if stale_cutoff_date:
            query = query.filter(WorkOrder.initiated_on <= stale_cutoff_date)

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        rows = pagination.items

        machines = [_build_machine_payload(machine, work_order) for machine, work_order in rows]

        return jsonify(
            success=True,
            machines=machines,
            page=page,
            total_pages=pagination.pages,
            total_items=pagination.total,
            stale_only=stale_only,
            stale_days=stale_days if stale_only else None,
            stale_cutoff_date=stale_cutoff_date.isoformat() if stale_cutoff_date else None,
        ), 200
    except Exception as e:
        current_app.logger.error(f"[MACHINE QUERY ERROR]: {e}")
        return jsonify(success=False, message="There was an error when querying for machines"), 500


@read_bp.get("/serial/<serial>")
def serial_search(serial):
    try:
        normalized_serial = (serial or "").strip().upper()
        machine = db.session.query(Machine).filter_by(serial=normalized_serial).first()
        if not machine:
            return jsonify(success=False, message="Machine not found."), 404

        latest_work_order = (
            db.session.query(WorkOrder)
            .filter_by(machine_id=machine.id)
            .order_by(WorkOrder.id.desc())
            .first()
        )

        if current_user.is_authenticated:
            current_app.logger.info(
                f"[MACHINE QUERY]: {current_user.first_name} {current_user.last_name} queried serial:{normalized_serial}"
            )

        return jsonify(success=True, machine=_build_machine_payload(machine, latest_work_order)), 200
    except Exception as e:
        current_app.logger.error(f"[SERIAL SEARCH ERROR]: {e}")
        return jsonify(success=False, message="There was an error when searching for machine by serial number"), 500


# --------------------
#    USER METRICS
# --------------------
@read_bp.get("/metrics/<int:id>")
def user_metrics(id):
    user = db.session.get(User, id)
    if not user:
        return jsonify(success=False, message="User not found."), 404

    start_date_raw = request.args.get("start_date")
    end_date_raw = request.args.get("end_date")
    event_types = [evt.strip().lower() for evt in request.args.getlist("event_type") if evt and evt.strip()]

    start_date = _parse_iso_date(start_date_raw)
    end_date = _parse_iso_date(end_date_raw)

    if start_date_raw and not start_date:
        return jsonify(success=False, message="Invalid start_date format. Use YYYY-MM-DD."), 400
    if end_date_raw and not end_date:
        return jsonify(success=False, message="Invalid end_date format. Use YYYY-MM-DD."), 400
    if start_date and end_date and start_date > end_date:
        return jsonify(success=False, message="start_date cannot be after end_date"), 400

    query = db.session.query(WorkOrderEvent).filter(WorkOrderEvent.technician_id == user.id)

    if start_date:
        query = query.filter(WorkOrderEvent.event_date >= start_date)
    if end_date:
        query = query.filter(WorkOrderEvent.event_date <= end_date)

    parsed_event_types = []
    for event_type in event_types:
        try:
            parsed_event_types.append(EventEnum(event_type))
        except ValueError:
            return jsonify(success=False, message=f"Invalid event_type filter: {event_type}"), 400

    if parsed_event_types:
        query = query.filter(WorkOrderEvent.event_type.in_(parsed_event_types))

    events = query.order_by(WorkOrderEvent.event_date.desc(), WorkOrderEvent.id.desc()).all()

    counts = {e.value: 0 for e in EventEnum}
    for event in events:
        counts[event.event_type.value] += 1

    metrics = {
        "user": f"{user.first_name} {user.last_name}",
        "range": {"start_date": start_date_raw, "end_date": end_date_raw},
        "counts": counts,
        "events": [e.serialize() for e in events],
    }
    return jsonify(success=True, metrics=metrics), 200


