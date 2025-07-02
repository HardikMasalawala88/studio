from typing import List, Optional
from pydantic import Field
from .base_model import BaseEntity
from datetime import datetime

class Case(BaseEntity):
    id: Optional[str]
    ClientId: str
    AdvocateId: str
    CaseTitle: str
    CaseDetail: str
    CaseNumber: str
    HearingDate: datetime
    CourtLocation: str
    CaseParentId: Optional[str] = None
    FilingDate: datetime = Field(default_factory=datetime.utcnow)
    CaseStatus: str = "Open"  
    CaseDocuments: Optional[List["CaseDocument"]] = []
  # ← forward reference as string

# ↓ Put this at the very bottom of case.py
from models.caseDocument import CaseDocument
Case.update_forward_refs()

# from typing import List, Optional
# from pydantic import Field
# from models.caseDocument import CaseDocument
# from .base_model import BaseEntity
# from datetime import datetime

# class Case(BaseEntity):
#     ClientId: str
#     AdvocateId: str
#     CaseTitle: str
#     CaseDetail: str
#     CaseNumber: str
#     HearingDate: datetime
#     CourtLocation: str
#     CaseParentId: Optional[str] = None
#     FilingDate: datetime = Field(default_factory=datetime.utcnow)
#     CaseStatus: str = "Open"  
#     CaseDocumentsFM: List["CaseDocument"] = []