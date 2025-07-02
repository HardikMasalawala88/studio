from datetime import datetime
from typing import Optional
from models.base_model import BaseEntity


class UserSubscription(BaseEntity):
    UserId: str  # Reference to ApplicationUser or Lawyer
    SubscriptionPackageId: str  # Reference to SubscriptionPackage
    PaymentId: Optional[str] = None  # Reference to Payment (nullable)
    StartDate: datetime
    EndDate: datetime
    IsActive: bool
    User: Optional["User"] = None
    SubscriptionPackage: Optional["SubscriptionPackage"] = None
    Payment: Optional["Payment"] = None

from models.subscriptionPackage import SubscriptionPackage
from models.user import User
from models.payment import Payment
UserSubscription.update_forward_refs()