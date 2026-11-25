# EduMind AI — Course Platform (Full-Stack)

EduMind is an autonomous AI course generation and curriculum platform powered by **Spring Boot 3 (Java 21)**, **Spring AI**, **Google Gemini**, **PostgreSQL**, and a modern **React 19 + Tailwind CSS + Vite** frontend.

---

## Architecture Overview

```
edumind-backend/
├── pom.xml                               # Spring Boot parent & dependencies
├── src/main/java/com/edumind/backend/
│   ├── BackendApplication.java           # Main application entry point
│   ├── config/                           # AsyncConfig, WebConfig (CORS)
│   ├── controller/                       # CourseController (REST & SSE endpoints)
│   ├── dto/                              # Standardized ApiResponse, DTOs, stats & requests
│   ├── entity/                           # Course, Module, Lesson, Quiz, Question, Option
│   ├── exception/                        # GlobalExceptionHandler, ResourceNotFoundException
│   ├── repository/                       # CourseRepository, ModuleRepository, LessonRepository, QuizRepository
│   └── service/                          # CourseService, SyllabusGenerationService, CourseExpansionService
├── src/main/resources/
│   └── application.yml                   # Database, AI model, server & CORS configuration
├── .env.example                          # Environment variable template
├── test_api.py                           # Automated end-to-end API test verification suite
├── package.json                          # Root orchestration runner (concurrently dev & build)
└── frontend/                             # React + Tailwind CSS + Vite SPA
    ├── src/
    │   ├── api/                          # Axios client & course endpoints
    │   ├── components/                   # Button, Input, Modal, Sidebar, Navbar, Loader, Toast, EmptyState
    │   ├── context/                      # AuthContext, ToastContext
    │   ├── layouts/                      # MainLayout (with responsive sidebar and navbar)
    │   ├── pages/                        # DashboardPage, CoursesPage, CourseDetailPage, StudioPage, AnalyticsPage, LoginPage
    │   ├── routes/                       # ProtectedRoute & routing configuration
    │   └── App.jsx                       # Application router root
    ├── vite.config.js                    # Vite configuration with Tailwind CSS & backend proxy
    └── .env.example                      # Frontend environment variable template
```

---

## Environment Variables

### Backend (`application.yml` or System Environment)
| Variable | Description | Default |
|---|---|---|
| `PORT` | Server listening port | `8080` |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://localhost:5432/edumind_db` |
| `SPRING_DATASOURCE_USERNAME` | PostgreSQL database user | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | PostgreSQL database password | `root` |
| `SPRING_AI_OPENAI_API_KEY` | Gemini API key | Configured in `application.yml` |
| `SPRING_AI_OPENAI_BASE_URL` | AI base URL | `https://generativelanguage.googleapis.com` |
| `SPRING_AI_OPENAI_CHAT_OPTIONS_MODEL` | Active Gemini model | `gemini-flash-lite-latest` |
| `CORS_ALLOWED_ORIGINS` | Permitted origins | `http://localhost:5173,http://localhost:3000,http://localhost:4200` |

### Frontend (`frontend/.env`)
| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API Base URL | `http://localhost:8080/api` |

---

## Quickstart & Commands

### 1. Run Both Backend and Frontend Simultaneously
```bash
npm run dev
```

### 2. Run Backend Only
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

### 3. Run Frontend Only
```bash
cd frontend
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

### 5. Run Automated API Tests
```bash
npm run test:api
```

---

## API Endpoints

All responses follow the unified standard response wrapper:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "error": null,
  "timestamp": "2026-11-19T15:10:01Z"
}
```

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/courses` | List all courses |
| `GET` | `/api/courses/search?query=...&audience=...&page=0&size=10` | Filter, paginate, and sort courses |
| `GET` | `/api/courses/{id}` | Get complete course details (modules, lessons, quizzes) |
| `POST` | `/api/courses/syllabus` | Generate a structured syllabus via Gemini AI |
| `GET` | `/api/courses/{id}/expand-stream` | Server-Sent Events (SSE) stream for full lesson markdown & quiz expansion |
| `DELETE` | `/api/courses/{id}` | Delete a course and all related entities |
| `POST` | `/api/courses/quizzes/{quizId}/submit` | Auto-grade and evaluate quiz answers with feedback |
| `GET` | `/api/courses/stats` | Platform metrics (courses, modules, lessons, quizzes) |
