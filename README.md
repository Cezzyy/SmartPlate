# SmartPlate - Automated Vehicle Plate Detection System

## 📌 Overview
SmartPlate is an **Automated Vehicle Plate Detection System** designed to improve vehicle identification and verification. The system leverages modern web technologies and robust backend services to enhance the accuracy, efficiency, and security of license plate recognition and registration tracking.

## 🚀 Features
- **Real-time License Plate Recognition**
- **User Authentication & Role-based Access Control**
- **Vehicle Registration Database & Advanced Search**
- **API Integration for External Data Syncing**
- **Responsive UI with Modern Design**
- **Secure Data Storage and Management**

## 🛠 Tech Stack

### Frontend
- **Framework**: Vue.js 3 with Composition API
- **State Management**: Pinia with persistence
- **Styling**: Tailwind CSS for responsive design
- **Icons**: Font Awesome
- **Routing**: Vue Router
- **Data Visualization**: Chart.js with Vue-ChartJS
- **TypeScript** for type safety

### Backend
- **Language**: Go 1.23+
- **Framework**: Echo v4 for RESTful API
- **Database**: PostgreSQL (via sqlx)
- **Authentication**: JWT with bcrypt password hashing
- **Logging**: zerolog for structured logging
- **WebSocket** support for real-time updates

## 📋 Getting Started

### Prerequisites
- Node.js (18.x or higher)
- Go (1.23.x or higher)
- PostgreSQL

### Installation

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
go mod tidy
go run cmd/api/main.go
```

## 🔧 Configuration
The application uses environment variables for configuration. Create a `.env` file in the backend directory with the following variables:
- `DB_CONNECTION_STRING` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing
- `PORT` - API server port (default: 8080)

## 🧪 Testing
```bash
# Frontend tests
cd frontend
npm run test:unit

# Backend tests
cd backend
go test ./...
```

## 📊 Project Structure
```
├── frontend/            # Vue.js frontend application
│   ├── src/             # Source files
│   ├── public/          # Static assets
│   └── ...
├── backend/             # Go backend API
│   ├── cmd/             # Application entry points
│   ├── internal/        # Internal packages
│   └── ...
└── README.md            # This file
```

## 📜 License
This project is licensed under the **MIT License**.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Contact
For questions or support, please open an issue in the repository.

---
⚡ **SmartPlate: Making Vehicle Identification Smarter**

