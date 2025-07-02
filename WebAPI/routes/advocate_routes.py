from datetime import datetime
import os
import shutil
from typing import List
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form, Depends
from db.mongodb import db
from models.client import Client
from models.case import Case
from models.caseDocument import CaseDocument
from models.user import User

router = APIRouter()
UPLOAD_DIR = "uploads/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ---------------------------------Client-------------------------------

@router.post("/add-client")
async def add_client(user: User):
    try:
        # Validate password match
        if user.password != user.confirmPassword:
            raise HTTPException(status_code=400, detail="Passwords do not match.")

        # Check uniqueness
        existing = await db.users.find_one({"$or": [{"username": user.username}, {"email": user.email}]})
        if existing:
            raise HTTPException(status_code=400, detail="Username or Email already exists.")

        # Assign metadata
        user_dict = user.dict(exclude={"confirmPassword"}, exclude_unset=True)
        user_dict["_id"] = ObjectId()
        user_dict["createdAt"] = datetime.utcnow()
        # user_dict["createdBy"] = user.email

        # Insert into users
        await db.users.insert_one(user_dict)

        # Insert into clients using same _id
        client_dict = {
            "_id": user_dict["_id"],
            "createdAt": user_dict["createdAt"],
            # "createdBy": user_dict["createdBy"],
            "cases": []
        }

        await db.clients.insert_one(client_dict)

        return {"message": "Client added successfully", "client_id": str(user_dict["_id"])}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.put("/clients/{client_id}")
async def update_client(client_id: str, updated_client: Client):
    try:
        object_id = ObjectId(client_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid client ID format.")

    # Ensure client exists
    client_in_db = await db.clients.find_one({"_id": object_id})
    if not client_in_db:
        raise HTTPException(status_code=404, detail="Client not found.")

    # Update Client collection (e.g., ModifiedAt, ModifiedBy if used)
    client_update = { 
        "modifiedAt": datetime.utcnow(),
        "modifiedBy": updated_client.user.email if updated_client.user else "system",
    }

    await db.clients.update_one({"_id": object_id}, {"$set": client_update})

    # Update User if provided
    if updated_client.user:
        user_update_data = updated_client.user.dict(exclude_unset=True, exclude={"confirmPassword"})
        user_update_data["modifiedAt"] = datetime.utcnow()
        user_update_data["modifiedBy"] = updated_client.user.email
        await db.users.update_one({"_id": object_id}, {"$set": user_update_data})

    return {"message": "Client and user updated successfully"}

@router.get("/clients", response_model=List[Client])
async def get_clients():
    try:
        clients = []
        async for client in db.clients.find({}):
            # Fetch user data
            user = await db.users.find_one({"_id": client["_id"]})
            if not user:
                continue

            # Normalize embedded cases and their documents
            for case in client.get("cases", []):
                case["id"] = case.get("id", "")  # Ensure 'id' exists in case

                for doc in case.get("CaseDocuments", []):
                    if "_id" in doc:
                        doc["id"] = str(doc["_id"])
                        doc.pop("_id", None)
                    elif "id" not in doc:
                        # fallback if no id at all (e.g., from manual inserts)
                        doc["id"] = ""

            client_data = {
                **client,
                "id": str(client["_id"]),
                "user": user
            }
            client_data.pop("_id", None)

            clients.append(Client(**client_data))

        return clients

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    
@router.get("/clients/{client_id}", response_model=Client)
async def get_client_by_id(client_id: str):
    try:
        if not ObjectId.is_valid(client_id):
            raise HTTPException(status_code=400, detail="Invalid client ID format.")

        client = await db.clients.find_one({"_id": ObjectId(client_id)})
        if not client:
            raise HTTPException(status_code=404, detail="Client not found.")

        user = await db.users.find_one({"_id": ObjectId(client_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User info for client not found.")

        # ✅ Normalize embedded cases and CaseDocuments
        for case in client.get("cases", []):
            case["id"] = case.get("id", "")  # Ensure 'id' exists

            for doc in case.get("CaseDocuments", []):
                if "_id" in doc:
                    doc["id"] = str(doc["_id"])
                    doc.pop("_id", None)
                elif "id" not in doc:
                    doc["id"] = ""  # fallback to avoid validation error

        client_data = {
            **client,
            "id": str(client["_id"]),
            "user": user
        }
        client_data.pop("_id", None)

        return Client(**client_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.delete("/clients/{client_id}")
async def remove_client(client_id: str):
    try:
        object_id = ObjectId(client_id)

        # Delete from client collection
        client_res = await db.clients.delete_one({"_id": object_id})

        # Delete from user collection
        user_res = await db.users.delete_one({"_id": object_id})

        if client_res.deleted_count or user_res.deleted_count:
            return {"status": "Success", "message": "Client and User Removed"}

        raise HTTPException(status_code=404, detail="Client not found")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Deletion failed: {str(e)}")


# ---------------------------------Case-------------------------------

@router.post("/add-case")
async def add_case(case: Case):
    case_dict = case.dict(by_alias=True)
    case_dict["_id"] = ObjectId()
    
    await db.cases.insert_one(case_dict)
     # Prepare the embedded case object (remove _id and convert to Pydantic-style field if needed)
    embedded_case = case_dict.copy()
    embedded_case["id"] = str(case_dict["_id"])
    embedded_case.pop("_id", None)
    
    # Update client with the new case
    result = await db.clients.update_one(
        {"_id": ObjectId(case.ClientId)},
        {"$push": {"cases": embedded_case}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Client not found or case not added to client")
    return {"message": "Case created", "case_id": str(case_dict["_id"])}
    # try:
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=str(e))

@router.put("/cases/{case_id}")
async def update_case(case_id: str, case: Case):
    try:
        # 1. Fetch existing case
        existing_case = await db.cases.find_one({"_id": ObjectId(case_id)})
        if not existing_case:
            raise HTTPException(status_code=404, detail="Case not found")

        # 2. Prepare updated CaseDocument list (only new ones)
        new_docs = []
        existing_doc_signatures = set(
            (doc["fileName"], doc["type"]) for doc in existing_case.get("CaseDocuments", [])
        )

        for doc in case.CaseDocuments or []:
            if (doc.fileName, doc.type) not in existing_doc_signatures:
                # Insert into CaseDocuments collection
                doc_dict = doc.dict(exclude_unset=True)
                doc_dict["caseId"] = case_id
                doc_dict["createdAt"] = doc_dict.get("createdAt") or datetime.utcnow()
                doc_dict["modifiedAt"] = datetime.utcnow()

                result = await db.casedocuments.insert_one(doc_dict)
                doc_dict["id"] = str(result.inserted_id)
                doc_dict.pop("_id", None)

                # Append to list to push into the Case table
                new_docs.append({
                    "url": doc_dict["url"],
                    "fileName": doc_dict["fileName"],
                    "type": doc_dict["type"]
                })

        # 3. Prepare final update dict (excluding CaseDocuments)
        case_dict = case.dict(exclude_unset=True, by_alias=True)
        case_dict.pop("CaseDocuments", None)  # We handle this manually

        # 4. Update the case (fields)
        await db.cases.update_one(
            {"_id": ObjectId(case_id)},
            {"$set": case_dict}
        )

        # 5. If new documents, push only those to CaseDocuments array
        if new_docs:
            await db.cases.update_one(
                {"_id": ObjectId(case_id)},
                {
                    "$push": {"CaseDocuments": {"$each": new_docs}},
                    "$set": {"modifiedAt": datetime.utcnow()}
                }
            )

        # 5. Prepare updated embedded case for Client
        updated_case = await db.cases.find_one({"_id": ObjectId(case_id)})

        # Convert MongoDB '_id' to 'id' in CaseDocuments
        case_docs = updated_case.get("CaseDocuments", [])
        for doc in case_docs:
            if "_id" in doc:
                doc["id"] = str(doc["_id"])
                doc.pop("_id", None)

        embedded_case = {
            **updated_case,
            "id": str(updated_case["_id"])
        }
        embedded_case.pop("_id", None)

        await db.clients.update_one(
            {
                "_id": ObjectId(case.ClientId),
                "cases.id": case_id
            },
            {
                "$set": {
                    "cases.$": embedded_case
                }
            }
        )


        return {"status": "Success", "message": "Case Updated"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cases", response_model=List[Case])
async def list_cases():
    cases = []
    try:
        async for doc in db.cases.find():
            doc["id"] = str(doc["_id"])
            doc.pop("_id", None)

            # Fetch related CaseDocuments
            case_docs = await db.casedocuments.find({"caseId": doc["id"]}).to_list(length=100)
            for d in case_docs:
                d["id"] = str(d.get("_id", ""))
                d.pop("_id", None)

            doc["CaseDocuments"] = case_docs
            cases.append(Case(**doc))
        return cases

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch cases: {str(e)}")

@router.get("/cases/{case_id}", response_model=Case)
async def get_case(case_id: str):
    try:
        case = await db.cases.find_one({"_id": ObjectId(case_id)})
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")

        case["id"] = str(case["_id"])
        case.pop("_id", None)

        case_docs = await db.casedocuments.find({"caseId": case["id"]}).to_list(length=100)
        for d in case_docs:
            d["id"] = str(d.get("_id", ""))
            d.pop("_id", None)

        case["CaseDocuments"] = case_docs

        return Case(**case)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch case: {str(e)}")


@router.delete("/cases/{case_id}")
async def remove_case(case_id: str):
    case = await db.cases.find_one({"_id": ObjectId(case_id)})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    # Delete from cases collection
    await db.cases.delete_one({"_id": ObjectId(case_id)})
    # Pull from client.cases array
    await db.clients.update_one(
        {"_id": ObjectId(case["ClientId"])},
        {"$pull": {"cases": {"id": case_id}}}
    )

    return {"status": "Success", "message": "Case Removed"}

# ------------------------Case Document-------------------------------

@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    caseId: str = Form(...)
):
    try:
        # 1. Save file to disk
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        file_name = f"{timestamp}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, file_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_url = f"/{UPLOAD_DIR}{file_name}"  # This must be served via StaticFiles
        file_type = file.content_type

        # 2. Create CaseDocument entry
        doc_data = {
            "url": file_url,
            "fileName": file.filename,
            "type": file_type,
            "caseId": caseId,
            "createdAt": datetime.utcnow(),
            "modifiedAt": datetime.utcnow(),
        }

        result = await db.casedocuments.insert_one(doc_data)
        doc_data["_id"] = result.inserted_id
        doc_data["id"] = str(result.inserted_id)

        # 3. Check if case exists
        case = await db.cases.find_one({"_id": ObjectId(caseId)})
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")

        # 4. Prevent duplicate files in case's CaseDocuments array
        existing_docs = case.get("CaseDocuments", [])
        already_exists = any(
            doc.get("fileName") == file.filename and doc.get("type") == file_type
            for doc in existing_docs
        )

        if not already_exists:
            await db.cases.update_one(
                {"_id": ObjectId(caseId)},
                {
                    "$push": {
                        "CaseDocuments": {
                            "url": file_url,
                            "fileName": file.filename,
                            "type": file_type
                        }
                    },
                    "$set": {"modifiedAt": datetime.utcnow()}
                }
            )

        return {
            "message": "Document uploaded and case updated",
            "document": {
                "url": file_url,
                "fileName": file.filename,
                "type": file_type
            },
            "id": str(result.inserted_id)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
