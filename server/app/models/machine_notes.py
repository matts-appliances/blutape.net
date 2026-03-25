from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, ForeignKey, Text, Date
from .base import Base
from datetime import date as DTdate

class MachineNote(Base):
    __tablename__ = "machine_notes"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    added_on: Mapped[DTdate] = mapped_column(Date, nullable=False, default=DTdate.today)
    technician_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    machine_id: Mapped[int] = mapped_column(Integer, ForeignKey("machines.id"), nullable=False)
    
    #----------relationships--------------
    machine = relationship("Machine", back_populates="notes")
    technician = relationship("User", back_populates="machine_notes", foreign_keys=[technician_id])
    
    def serialize(self) -> dict:
        return {
            "id": self.id,
            "content": self.content,
            "added_on": self.added_on.strftime("%Y-%m-%d"),
            "technician_id": self.technician_id,
            "machine_id": self.machine_id,
            "technician": {
                "first_name": self.technician.first_name,
                "last_name": self.technician.last_name
            }
        }
    