# 🗂️ TaskFlow - Team Task Manager

A full-stack web application for managing team tasks with role-based access control.

## 🚀 Tech Stack
- **Backend:** FastAPI + SQLite
- **Frontend:** React + Vite + Tailwind CSS
- **Auth:** JWT Tokens

## 👥 Roles
- **Admin:** Create projects, assign tasks, manage team
- **Member:** View and update assigned tasks

## 🔗 Live URL
[Add your Railway URL here]

## ⚙️ Run Locally

### Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

### Frontend
cd frontend
npm install
npm run dev
