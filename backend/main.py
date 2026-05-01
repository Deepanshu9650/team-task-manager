from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

import models
import database
import auth

# Initialize Database
database.init_db()

app = FastAPI(title="Team Task Manager API")

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth routes from auth.py
app.include_router(auth.router)


# --- Pydantic Schemas ---
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: int
    assigned_to: int
    due_date: Optional[datetime] = None

class TaskUpdateStatus(BaseModel):
    status: str  # "To-Do", "In-Progress", "Done"


# --- PROJECT ROUTES ---

@app.post("/projects")
def create_project(
    project: ProjectCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_admin)
):
    new_project = models.Project(name=project.name, description=project.description)
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return {
        "id": new_project.id,
        "name": new_project.name,
        "description": new_project.description,
        "created_at": str(new_project.created_at) if new_project.created_at else None
    }

@app.get("/projects")
def get_projects(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    projects = db.query(models.Project).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "created_at": str(p.created_at) if p.created_at else None
        }
        for p in projects
    ]


# --- TASK ROUTES ---

@app.post("/tasks")
def create_task(
    task: TaskCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_admin)
):
    new_task = models.Task(
        title=task.title,
        description=task.description,
        project_id=task.project_id,
        assigned_to=task.assigned_to,
        due_date=task.due_date
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return {
        "id": new_task.id,
        "title": new_task.title,
        "description": new_task.description,
        "status": new_task.status,
        "project_id": new_task.project_id,
        "assigned_to": new_task.assigned_to,
        "due_date": str(new_task.due_date) if new_task.due_date else None
    }

@app.get("/tasks")
def get_tasks(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    tasks = db.query(models.Task).all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "project_id": t.project_id,
            "assigned_to": t.assigned_to,
            "due_date": str(t.due_date) if t.due_date else None
        }
        for t in tasks
    ]

@app.patch("/tasks/{task_id}/status")
def update_task_status(
    task_id: int,
    status_update: TaskUpdateStatus,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = status_update.status
    db.commit()
    return {"message": "Status updated successfully"}


# --- USER ROUTES ---

@app.get("/users")
def get_users(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    users = db.query(models.User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "role": u.role.value
        }
        for u in users
    ]

@app.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_admin)
):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="You cannot delete yourself!")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@app.post("/users/add")
def add_user(
    user: auth.UserCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_admin)
):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = auth.get_password_hash(user.password)

    try:
        role_enum = models.UserRole(user.role)
    except ValueError:
        role_enum = models.UserRole.MEMBER

    new_user = models.User(
        email=user.email,
        hashed_password=hashed_pw,
        role=role_enum
    )
    db.add(new_user)
    db.commit()
    return {"message": f"User {user.email} added successfully"}