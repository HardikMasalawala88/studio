from fastapi import FastAPI
from routes import advocate_routes
from routes import superadmin_routes
from routes import account_routes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Case Tracker API")

origins = [
    "http://localhost:9002",  # React frontend
    "http://192.168.0.104:9002",
    # You can add more allowed origins here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # Specific frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(advocate_routes.router, prefix="/advocate", tags=["Advocate"])

app.include_router(superadmin_routes.router, prefix="/superadmin", tags=["SuperAdmin"])

app.include_router(account_routes.router, prefix="/account", tags=["Account"])

@app.get("/")
def root():
    return {"message": "Welcome to Case Tracker"}
