from flask import jsonify, current_app, Blueprint, request, Response, render_template
from app.extensions import db
from app.models import Machine, User, WorkOrder, WorkOrderEvent
from app.models.enums import EventEnum
from flask_login import login_required, current_user
from io import StringIO
from datetime import datetime, date
import csv
import pdfkit
import os



export_bp = Blueprint("export", __name__)


def build_user_report(user_id, start_date, end_date):
    user = db.session.get(User, user_id)
    events = (
        db.session.query(WorkOrderEvent)
        .join(Machine, Machine.id == WorkOrderEvent.machine_id)
        .filter(
            WorkOrderEvent.technician_id == user_id,
            WorkOrderEvent.event_date >= start_date,
            WorkOrderEvent.event_date <= end_date,
        )
        .order_by(WorkOrderEvent.event_date.asc(), WorkOrderEvent.id.asc())
        .all()
    )

    rows = []
    for event in events:
        machine = event.machine
        rows.append(
            {
                "brand": machine.brand if machine else None,
                "machine_type": str(machine.category) if machine else None,
                "machine_style": machine.form_factor if machine else None,
                "status": str(event.event_type),
                "date": event.event_date.isoformat() if event.event_date else None,
            }
        )

    return {
        "user": {
            "id": user.id if user else user_id,
            "name": f"{user.first_name} {user.last_name}" if user else str(user_id),
        },
        "rows": rows,
    }

def generate_user_report_csv(report):
    output = StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "Brand",
        "Machine Type",
        "Machine Style",
        "Status",
        "Date"
    ])
    
    for r in report["rows"]:
        writer.writerow([
            r["brand"],
            r["machine_type"],
            r["machine_style"],
            r["status"],
            r["date"]
        ])
        
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=user_report.csv"
        }
    )
    
def generate_user_report_pdf(report, start_date, end_date):
    html = render_template(
        "user_report.html",
        report=report,
        start=start_date,
        end=end_date
    )
    WKTHMLTOPDF_PATH = (
        r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
        if os.name == "nt"
        else "/usr/bin/wkhtmltopdf"
    )

    config = pdfkit.configuration(
        wkhtmltopdf=WKTHMLTOPDF_PATH
    )
    
    pdf = pdfkit.from_string(
        html,
        False,
        options={
            "quiet": "",
            "encoding": "UTF-8"
        },
        configuration=config
    )
    
    return Response(
        pdf,
        mimetype="application/pdf",
        headers={
            "Content-Disposition": "inline; filename=user_report.pdf"
        }
    )
    

def build_completed_manifest_payload(manifest_date: date):
    events = (
        db.session.query(WorkOrderEvent)
        .join(WorkOrder, WorkOrder.id == WorkOrderEvent.work_order_id)
        .join(Machine, Machine.id == WorkOrderEvent.machine_id)
        .filter(
            WorkOrderEvent.event_type == EventEnum.COMPLETED,
            WorkOrderEvent.event_date == manifest_date,
        )
        .order_by(WorkOrderEvent.id.desc())
        .all()
    )

    seen_machine_ids = set()
    machines = []
    for event in events:
        if event.machine_id in seen_machine_ids:
            continue

        seen_machine_ids.add(event.machine_id)
        machine = event.machine
        work_order = event.work_order
        if not machine:
            continue

        machines.append(
            {
                "blutape_machine_id": machine.id,
                "blutape_work_order_id": work_order.id if work_order else None,
                "blutape_event_id": event.id,
                "completed_on": event.event_date.isoformat() if event.event_date else None,
                "serial": machine.serial,
                "brand": machine.brand,
                "model": machine.model,
                "category": str(machine.category) if machine.category else None,
                "form_factor": machine.form_factor,
                "color": machine.color,
                "condition": str(machine.condition) if machine.condition else None,
                "vendor": str(machine.vendor) if machine.vendor else None,
                "description": f"{machine.brand} {machine.model}".strip(),
            }
        )

    machines.reverse()
    return {
        "manifest_date": manifest_date.isoformat(),
        "manifest_id": f"BLU-COMP-{manifest_date.strftime('%Y%m%d')}",
        "machines": machines,
    }


@export_bp.route("/user_report/<int:id>", methods=["GET"])
@login_required
def export_user_report(id):
    user = db.session.get(User, id)
    if not user:
        return jsonify(success=False, message="User not found"), 404
    
    start_str = request.args.get("start")
    end_str = request.args.get("end")
    fmt = request.args.get("format", "pdf")
    
    try:
        start_date = datetime.strptime(start_str, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_str, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return jsonify(success=False, message="Invalid date format, use YYYY-MM-DD"), 400
    
    report = build_user_report(id, start_date, end_date)
    
    if not report["rows"]:
        return jsonify(success=False, message="No records in date range"), 404
    
    if fmt == "csv":
        current_app.logger.info(f"[CSV EXPORT]: {current_user.first_name} {current_user.last_name} has exported {user.first_name} {user.last_name}'s machine data")
        return generate_user_report_csv(report)
    elif fmt == "pdf":
        current_app.logger.info(f"[PDF EXPORT]: {current_user.first_name} {current_user.last_name} has exported {user.first_name} {user.last_name}'s machine data")
        return generate_user_report_pdf(report, start_date, end_date)
    else:
        current_app.logger.info(f"[EXPORT ERROR]: There was an error when exporting machine data for {user.first_name} {user.last_name}")
        return jsonify(success=False, message="Invalid format request."), 400


@export_bp.get("/completed_manifest")
@login_required
def export_completed_manifest():
    manifest_date_raw = (request.args.get("date") or "").strip()
    if not manifest_date_raw:
        return jsonify(success=False, message="date is required"), 400

    try:
        manifest_date = date.fromisoformat(manifest_date_raw)
    except ValueError:
        return jsonify(success=False, message="date must be YYYY-MM-DD"), 400

    payload = build_completed_manifest_payload(manifest_date)
    return jsonify(success=True, payload=payload), 200
