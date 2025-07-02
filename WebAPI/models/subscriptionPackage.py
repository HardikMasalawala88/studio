from models.base_model import BaseEntity


class SubscriptionPackage(BaseEntity):
    Name: str
    DurationDays: int
    IsTrial: bool
    PackagePrice: int
    IsActive: bool
