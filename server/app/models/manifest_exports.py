from datetime import datetime as DTdatetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class ManifestExport(Base):
    __tablename__ = "manifest_exports"

    __table_args__ = (
        UniqueConstraint(
            "work_order_event_id",
            "export_target",
            name="uq_manifest_exports_event_target",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    machine_id: Mapped[int] = mapped_column(ForeignKey("machines.id"), nullable=False, index=True)
    work_order_id: Mapped[int] = mapped_column(ForeignKey("work_orders.id"), nullable=False, index=True)
    work_order_event_id: Mapped[int] = mapped_column(
        ForeignKey("work_order_events.id"),
        nullable=False,
        index=True,
    )
    export_target: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    export_source_date: Mapped[Date] = mapped_column(Date, nullable=False, index=True)
    exported_manifest_id: Mapped[str | None] = mapped_column(String(150), nullable=True, index=True)
    exported_at: Mapped[DTdatetime] = mapped_column(DateTime, nullable=False, default=DTdatetime.utcnow)

    def serialize(self) -> dict:
        return {
            "id": self.id,
            "machine_id": self.machine_id,
            "work_order_id": self.work_order_id,
            "work_order_event_id": self.work_order_event_id,
            "export_target": self.export_target,
            "export_source_date": self.export_source_date.isoformat(),
            "exported_manifest_id": self.exported_manifest_id,
            "exported_at": self.exported_at.isoformat(),
        }
