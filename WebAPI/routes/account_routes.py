from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from db.mongodb import db
from models.auth import RegisterFM, LoginFM
from models.user import User
from models.advocate import Advocate
from bson import ObjectId

router = APIRouter()

@router.post("/register")
async def register_user(registerFM: RegisterFM):
    # Password match validation
    if registerFM.password != registerFM.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    # Check if username or email exists
    existing_user = await db.users.find_one({"$or": [{"username": registerFM.username}, {"email": registerFM.email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already exists.")

    # Prepare user document (exclude `advocate`)
    user_dict = registerFM.dict(exclude={"advocate", "confirmPassword"}, exclude_unset=True)
    user_dict["_id"] = ObjectId()
    user_dict["createdAt"] = datetime.utcnow()
    user_dict["modifiedAt"] = datetime.utcnow()
    user_dict["createdBy"] = registerFM.email

    # Insert user
    await db.users.insert_one(user_dict)

    # If Advocate, insert into advocates collection
    if registerFM.role.lower() == "advocate" and registerFM.advocate:
        advocate_dict = registerFM.advocate.dict()
        advocate_dict["_id"] = user_dict["_id"]  # Same ID as user
        advocate_dict["createdBy"] = registerFM.email
        await db.advocates.insert_one(advocate_dict)

    response_data = {
        "id": str(user_dict["_id"]),
        "username": user_dict["username"],
        "role": user_dict.get("role"),
        "firstname": user_dict["firstName"],
        "lastname": user_dict["lastName"],
        "createdAt": user_dict["createdAt"],
    }
    return {"message": "User registered successfully", "user": response_data}

@router.post("/login")
async def login_user(loginFM: LoginFM):
    print("Received login:", loginFM.dict())
    user = await db.users.find_one({"username": loginFM.username})
    print("Received user:", user)
    
    if not user or user["password"] != loginFM.password:
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    
    response_data = {
        "id": str(user["_id"]),
        "username": user["username"],
        "role": user.get("role"),
        "firstname": user["firstName"],
        "lastname": user["lastName"],
        "createdAt": user["createdAt"],
    }

    return {"message": "Login successful", "user": response_data}

# @router.post("/register")
# async def register_user(registerFM: RegisterFM):
#     user_dict = registerFM.dict(exclude={"advocate"}, exclude_unset=True)
#     user_dict["_id"] = ObjectId()
#     user_dict["createdBy"] = registerFM.email
#     user_dict["modifiedAt"] = ""
#     user_dict["createdAt"] = datetime.utcnow().isoformat()

#     # Insert user
#     await db.users.insert_one(user_dict)

#     # Insert into Advocates collection if applicable
#     if registerFM.role.lower() == "advocate" and registerFM.advocate:
#         advocate_data = registerFM.advocate.dict(exclude_unset=True)
#         advocate_data["_id"] = user_dict["_id"]
#         advocate_data["createdBy"] = user_dict["createdBy"]
#         advocate_data["modifiedAt"] = user_dict["modifiedAt"]

#         await db.advocates.insert_one(advocate_data)

#     return {"message": "User registered successfully", "user_id": str(user_dict["_id"])}


# @router.post("/login")
# async def login_user(loginModel: LoginFM):
#     user = await db.users.find_one({"username": loginModel.username})
#     if not user or user["password"] != loginModel.password:
#         raise HTTPException(status_code=401, detail="Invalid credentials")

#     return {
#         "status": "Success",
#         "message": "Login successful",
#         "user": {
#             "id": str(user["_id"]),
#             "username": user["username"],
#             "role": user.get("role"),
#             "firstname": user["firstName"],
#             "lastname": user["lastName"],
#             "createdAt": user["createdAt"],
#         }
#     }

