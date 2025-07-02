from datetime import datetime
from typing import Optional
from models.base_model import BaseEntity


class Payment(BaseEntity):
    OrderId: str
    Amount: float
    Status: str
    SubscriptionPackageId: str  # Reference to SubscriptionPackage._id
    UserId: str                 # Reference to ApplicationUser._id
    PaymentDate: datetime
    SubscriptionPackage: Optional["SubscriptionPackage"] = None
    User: Optional["User"] = None

from models.subscriptionPackage import SubscriptionPackage
from models.user import User
Payment.update_forward_refs()