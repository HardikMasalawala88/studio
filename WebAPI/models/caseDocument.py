from typing import Optional
from models.base_model import BaseEntity

class CaseDocument(BaseEntity):
    id: Optional[str]
    url: str
    fileName: str
    type: str
    caseId: Optional[str] = None  # Foreign key to Case._id


    # Case: Optional["Case"] = None  # ← forward reference

from models.case import Case
CaseDocument.update_forward_refs()

# from typing import Optional
# from models.case import Case
# from models.base_model import BaseEntity

# class CaseDocument(BaseEntity):
#     Url: str
#     FileName: str
#     Type: str
#     CaseId: str  # Foreign key to Case._id
#     CaseFM: Optional["Case"] = None