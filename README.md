# CampusShare - Student Resource Sharing Platform

A modern, minimal, and elegant web platform where students can share textbooks, laptops, cloud credits, and form study groups. Built with a focus on beautiful design and excellent user experience.

## 🌟 Features

- **Marketplace**: Buy, sell, or rent academic resources
- **Study Groups**: Form and join study groups for courses
- **User Authentication**: Secure login and registration system
- **Messaging**: Connect with other students
- **Responsive Design**: Works perfectly on all devices
- **Dark/Light Theme**: Beautiful theme switching
- **Real-time Updates**: Live data synchronization

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** database
- **JWT** authentication
- **bcrypt** password hashing
- **Express Validator** for input validation

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** for forms

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB installed and running
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CampusShare
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cd backend
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/campus-share
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=development
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

       This will start both:
    - Backend server on http://localhost:8000
    - Frontend development server on http://localhost:3000

### Alternative: Run separately

**Backend only:**
```bash
cd backend
npm run dev
```

**Frontend only:**
```bash
cd frontend
npm run dev
```

## 📁 Project Structure

```
CampusShare/
├── backend/                 # Express.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── utils/          # Utility functions
│   │   └── main.jsx        # App entry point
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── package.json            # Root package.json
└── README.md               # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Listings
- `GET /api/listings` - Get all listings with filters
- `GET /api/listings/:id` - Get specific listing
- `POST /api/listings` - Create new listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Study Groups
- `GET /api/groups` - Get all study groups
- `GET /api/groups/:id` - Get specific group
- `POST /api/groups` - Create new group
- `POST /api/groups/:id/join` - Join group
- `POST /api/groups/:id/leave` - Leave group

### Messages
- `GET /api/messages` - Get user conversations
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark as read

## 🎨 Design System

The application uses a carefully crafted design system with:

- **Minimal Color Palette**: Clean, professional colors
- **Typography**: Clear, readable fonts
- **Spacing**: Consistent spacing using Tailwind's scale
- **Components**: Reusable UI components
- **Themes**: Dark and light mode support
- **Responsive**: Mobile-first design approach

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS protection
- Helmet.js security headers

## 🚀 Deployment

### Backend Deployment
1. Set environment variables for production
2. Build and deploy to your preferred hosting service
3. Ensure MongoDB connection is configured

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure API base URL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues
2. Create a new issue with detailed information
3. Include your environment details and error messages

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for better student resource sharing
- Designed with accessibility and user experience in mind

---

**CampusShare** - Connecting students through resource sharing and collaboration. 🎓✨
