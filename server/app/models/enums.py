from enum import Enum
from sqlalchemy import Enum as SAEnum


def _enum_values(enum_cls):
    return [member.value for member in enum_cls]


def _enum_column(enum_cls, name: str):
    return SAEnum(
        enum_cls,
        name=name,
        native_enum=False,
        validate_strings=True,
        values_callable=_enum_values,
        length=max(len(member.value) for member in enum_cls),
    )


class RoleEnum(str, Enum):
    TECHNICIAN = "technician"
    SALES = "sales"
    DELIVERY = "delivery" 
    CLEANER = "cleaner"
    ADMIN = "admin"
    
    def __str__(self):
        return self.value
    
RoleEnumSA = _enum_column(RoleEnum, "role_enum")


class StatusEnum(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    TRASHED = "trashed"
    ARCHIVED = "archived"
    
    def __str__(self):
        return self.value
    
StatusEnumSA = _enum_column(StatusEnum, "status_enum")


class EventEnum(str, Enum):
    INITIATED = "initiated"
    COMPLETED = "completed"
    TRASHED = "trashed"
    REOPENED = "reopened"
    ARCHIVED = "archived"
    UNARCHIVED = "unarchived"
    
    def __str__(self):
        return self.value
    
EventEnumSA = _enum_column(EventEnum, "event_enum")


class EventReasonEnum(str, Enum):
    DEFAULT = "default"
    WARRANTY = "warranty"
    RETURN = "return"
    
    def __str__(self):
        return self.value
    

EventReasonEnumSA = _enum_column(EventReasonEnum, "event_reason_enum")


class VendorEnum(str, Enum):
    PASADENA = "pasadena"
    BATON_ROUGE = "baton_rouge"
    COLLEGE_STATION = "college_station"
    ALEXANDRIA = "alexandria"
    STINES = "stines"
    SCRAPPERS = "scrappers"
    VIKING = "viking"
    UNKNOWN = "unknown"
    
    def __str__(self):
        return self.value
    
    
VendorEnumSA = _enum_column(VendorEnum, "vendor_enum")


class ConditionEnum(str, Enum):
    NEW = "new"
    USED = "used"
    SCRATCH_AND_DENT = "scratch_and_dent"
    
    def __str__(self):
        return self.value
    
ConditionEnumSA = _enum_column(ConditionEnum, "condition_enum")


class CategoryEnum(str, Enum):
    REFRIGERATOR = "refrigerator"
    FREEZER = "freezer"
    WASHER = "washer"
    DRYER = "dryer"
    RANGE = "range"
    OVEN = "oven"
    MICROWAVE = "microwave"
    WATER_HEATER = "water_heater"
    LAUNDRY_TOWER = "laundry_tower"
    DISHWASHER = "dishwasher"
    
    def __str__(self):
        return self.value
    
CategoryEnumSA = _enum_column(CategoryEnum, "type_enum")
