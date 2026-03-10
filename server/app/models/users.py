from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Boolean
from .base import Base
from .enums import RoleEnum, RoleEnumSA
from flask_login import UserMixin

class User(Base, UserMixin):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    first_name: Mapped[str] = mapped_column(String(150), nullable=False)
    last_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(150), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    
    role: Mapped[RoleEnum] = mapped_column(RoleEnumSA, nullable=False, default=RoleEnum.TECHNICIAN)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    
    #----------relationships--------------
    initiated_work_orders = relationship("WorkOrder", back_populates="initiator", foreign_keys="WorkOrder.initiated_by")
    work_order_events = relationship("WorkOrderEvent", back_populates="technician", foreign_keys="WorkOrderEvent.technician_id")
    machine_notes = relationship("MachineNote", back_populates="technician", foreign_keys="MachineNote.technician_id")
    
    
    
    def serialize(self) -> dict:
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "role": str(self.role),
            "is_active": self.is_active
        }