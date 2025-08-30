
# Streamify - Full-Stack Video Streaming Platform

Streamify is a modern, full-stack video streaming application built with a Django backend and a React frontend. It provides a platform for users to upload, watch, and interact with video content.

## Features

*   **User Authentication:** Secure user registration and login system.
*   **Video Management:** Users can upload, view, and manage their video content.
*   **Video Streaming:** Smooth video playback using a modern, responsive player.
*   **Interactive UI:** Comment on videos, like videos, and subscribe to channels.
*   **RESTful API:** A well-structured API built with Django REST Framework to serve the frontend.
*   **Responsive Design:** The user interface is built with Material UI and Tailwind CSS, making it responsive and accessible on various devices.

## Tech Stack

**Backend:**
*   Python
*   Django
*   Django REST Framework
*   Database: SQLite3 (default)

**Frontend:**
*   JavaScript
*   React.js
*   Vite
*   React Router
*   Axios
*   Styling: Material UI & Tailwind CSS

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

*   Python 3.8+ and `pip`
*   Node.js v18+ and `yarn` (or `npm`)
*   Git

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd django-project
    ```

2.  **Backend Setup:**
    ```bash
    # Navigate to the backend directory
    cd backend/Streamify

    # Create and activate a virtual environment
    python -m venv env
    source env/bin/activate  # On Windows use `env\Scripts\activate`

    # Install Python dependencies
    pip install -r ../../backend/requirements.txt 

    # Apply database migrations
    python manage.py migrate

    # Start the Django development server
    python manage.py runserver
    ```
    The backend API will be running at `http://127.0.0.1:8000`.

3.  **Frontend Setup:**
    ```bash
    # Open a new terminal and navigate to the frontend directory
    cd frontend

    # Install JavaScript dependencies
    yarn install

    # Start the Vite development server
    yarn dev
    ```
    The frontend application will be running at `http://localhost:5173`.

## Project Structure

The project is organized into two main directories: `backend` and `frontend`.

```
.
├── backend/
│   ├── Streamify/       # Django project root
│   │   ├── accounts/    # User authentication app
│   │   ├── comments/    # Comments app
│   │   ├── subscription/# Subscription app
│   │   ├── video/       # Video management app
│   │   ├── manage.py    # Django's command-line utility
│   │   └── ...
│   └── requirements.txt # Backend dependencies
│
└── frontend/
    ├── src/             # React source code
    │   ├── Components/  # Reusable React components
    │   ├── pages/       # Page components
    │   ├── utils/       # Utility functions
    │   ├── api.jsx      # API request handling
    │   └── ...
    ├── package.json     # Frontend dependencies
    └── vite.config.js   # Vite configuration
```
