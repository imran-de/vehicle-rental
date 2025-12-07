# 🚗 Motor Rent API

A robust backend API for a Vehicle Rental Reservation System. This application enables users to browse and book vehicles while providing administrators with tools to manage inventory, bookings, and users.

> **Live URL:** [Insert Live URL Here]
> **Repository:** [Insert GitHub Repo URL Here]

---

## ✨ Features

- **🔐 User Authentication & Authorization**
  - Secure Sign Up & Sign In (JWT-based).
  - Role-Based Access Control (Admin vs. Customer).

- **🚙 Vehicle Management**
  - CRUD operations for vehicles.
  - Real-time availability tracking.
  - Strict type validation (Car, Bike, Van, SUV).

- **📅 Booking System**
  - Automated price calculation based on rental duration.
  - **Smart Auto-Return**: Automatically processes expired bookings and updates vehicle availability without background jobs.
  - Conflict prevention ensures vehicles cannot be double-booked.

- **🛠️ System Robustness**
  - **Auto-Initialization**: Database tables are automatically created on server startup.
  - **Global Error Handling**: Standardized error responses with descriptive messages.
  - **Data Integrity**: Prevention of deleting users/vehicles with active bookings.

---

## 🛠️ Technology Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Driver**: [node-postgres (pg)](https://node-postgres.com/)
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt

---

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- **Node.js** (v16 or higher)
- **PostgreSQL** (installed and running)
- **npm** or **yarn**

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd Motor_Rent
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory and configure the following variables:
    ```env
    NODE_ENV=development
    PORT=5000
    DATABASE_URL=postgresql://username:password@localhost:5432/motor_rent_db
    BCRYPT_SALT_ROUNDS=12
    JWT_SECRET=your_super_secret_key
    ```
    *Note: The system will automatically create the necessary tables in your database upon first run.*

4.  **Build the Project (Convert TS to JS)**
    To compile the TypeScript code into JavaScript (output to `dist/` folder):
    ```bash
    npm run build
    ```

5.  **Run the Application**
    *   **Development Mode** (with hot-reload):
        ```bash
        npm run dev
        ```
    *   **Production Mode** (runs the built JS files):
        ```bash
        npm start
        ```

6.  **Access the API**
    The server will start at `http://localhost:5000` (or your defined port).

---

## 📖 API Documentation

The API follows strict RESTful conventions. For detailed endpoint usage, request formats, and response examples, please refer to the **[API Reference](API_REFERENCE.md)**.

### Quick Overview
| Module | Base URL | Description |
| :--- | :--- | :--- |
| **Auth** | `/api/v1/auth` | User registration and login |
| **Vehicles** | `/api/v1/vehicles` | Manage vehicle inventory |
| **Bookings** | `/api/v1/bookings` | Create and manage reservations |
| **Users** | `/api/v1/users` | Admin user management |

---

## 📂 Project Structure

```
src/
├── config/         # Database and env configuration
├── middlewares/    # Auth, Validation, Error handling
├── modules/        # Feature modules (Auth, User, Vehicle, Booking)
│   ├── *.controller.ts
│   ├── *.service.ts
│   ├── *.route.ts
│   └── *.interface.ts
├── utils/          # Helper functions (AppError, sendResponse)
├── app.ts          # Express app setup
└── server.ts       # Server entry point
```

---

---

**Developed with ❤️ by Imran Ahmed**
