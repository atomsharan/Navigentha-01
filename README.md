# Nexora – Agentic AI Career Navigator

An **agentic, human-centered AI career navigation platform** designed for students who are confused about their future and don’t even know what questions to ask. Nexora goes beyond traditional chatbots by proactively driving conversations, maintaining long-term context, generating adaptive career roadmaps, and escalating to real human guidance when life decisions go beyond what AI alone should handle.

Built for hackathons, real-world impact, and future scalability.

---

## 📋 Table of Contents

* [Problem Statement](#problem-statement)
* [Solution Overview](#solution-overview)
* [Key Features](#key-features)
* [Tech Stack](#tech-stack)
* [Installation](#installation)
* [Running the Application](#running-the-application)
* [API Endpoints](#api-endpoints)
* [Project Structure](#project-structure)

---

## 🧩 Problem Statement

Students—especially after 12th grade—face overwhelming career choices with incomplete, generic, or misleading guidance. Existing platforms behave like static chatbots: they wait for questions, forget context, overwhelm users, and fail to handle emotional uncertainty or real-life decision pressure.

---

## 💡 Solution Overview

Nexora introduces an **Agentic AI system** that:

* Takes control of the conversation instead of waiting for prompts
* Learns continuously from user interactions
* Suggests suitable colleges, courses, and career paths *before* generating roadmaps
* Breaks long-term goals into short, trackable milestones
* Integrates **human mentors and experts** when AI reaches its limits

This is not a Q&A bot. It is a **decision-navigation ecosystem**.

---

## ✨ Key Features

* **Agentic Conversation Flow** – AI proactively asks the right questions in the right order
* **Context-Aware Memory** – Tracks full conversation history and adapts responses dynamically
* **Early Career & College Matching** – Suggests suitable courses and colleges before roadmaps
* **Adaptive Career Roadmaps** – Auto-generates multi-stage roadmaps with short-term goals
* **Roadmap Redirection Module** – Users are redirected to a dedicated roadmap tracking view
* **Reality-Check Engine** – Honest feedback when goals don’t align with current skill levels
* **Human-in-the-Loop Support** – Connects users to mentors, entrepreneurs, and domain experts
* **Secure Authentication** – JWT-based login system
* **Responsive UI** – Clean, modern interface for demos and judges

---

## 🛠 Tech Stack

### Backend

* **Django 4.2** – Backend framework
* **Django REST Framework** – API layer
* **JWT (SimpleJWT)** – Authentication
* **Redis** – Session & context caching
* **SQLite / MySQL** – Database

### Frontend

* **React 18 + TypeScript** – Frontend
* **Vite** – Build tool
* **Tailwind CSS** – Styling
* **Shadcn/ui** – UI components

### AI Layer

* **OpenAI (GPT)** – Primary reasoning engine
* **Google Gemini** – Fallback LLM
* **Intent & Context Tracking Logic** – Custom agent behavior

---

## 🚀 Installation

```bash
git clone https://github.com/atomsharan/Navigentha-01
cd Navigentha-01
```

### Backend Setup

```bash
python -m venv eenv
source eenv/bin/activate  # Windows: eenv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 📱 Running the Application

* Backend: `http://localhost:8000`
* Frontend: `http://localhost:5173`

---

## 🔌 API Endpoints

* `POST /api/chat/` – Agentic chat interaction
* `GET /api/chat/history/` – Full conversation memory
* `POST /api/advice/` – Career & roadmap generation
* `GET /api/mentors/` – Human mentor access (conceptual)

---

## 📁 Project Structure

```
NexoraV1/
├── career_ai/        # Django project
├── chat/             # Agentic AI logic
├── core/             # Auth & profiles
├── data/             # Career datasets
├── frontend/         # React app
└── README.md
```

---

## 🏁 Hackathon Note

This project demonstrates how **Agentic AI + Human Oversight** can solve real decision-making problems at scale. Nexora prioritizes clarity over complexity, honesty over hype, and guidance over generic advice.

> *AI gives precision. Humans give direction. Students gain clarity.*
