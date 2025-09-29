# Manpower Management System

A modern React frontend for managing workers, employers, and administrative oversight in a comprehensive manpower management platform.

## System Overview

The system is designed with three distinct user entities, each with their own dedicated workflows and interfaces:

### 🔵 Worker Dashboard
- **Job Search & Applications**: Browse available job opportunities and submit applications
- **Application Tracking**: Monitor the status of submitted applications (pending, reviewed, interview, accepted, rejected)
- **Profile Management**: Maintain personal information, skills, and resume uploads
- **Personalized Experience**: Tailored job recommendations based on skills and location

### 🟢 Employer Dashboard
- **Job Posting Management**: Create, edit, and manage job postings with detailed requirements
- **Application Review**: Review candidate applications and manage hiring pipeline
- **Candidate Management**: Track applicant status through the hiring process
- **Analytics & Insights**: View hiring metrics, application trends, and performance data

### 🟣 Board Dashboard (Administrative)
- **System Overview**: Comprehensive analytics and system health monitoring
- **User Management**: Manage worker and employer accounts, including verification and moderation
- **Platform Analytics**: Track job posting performance, success rates, and user engagement
- **System Configuration**: Configure platform settings, policies, and operational parameters

## Features

### Multi-Entity Architecture
- **Role-Based Access**: Distinct interfaces for workers, employers, and administrators
- **Secure Workflows**: Each entity type has access only to relevant functionality
- **Scalable Design**: Modular component structure for easy maintenance and extension

### Modern UI/UX
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Intuitive Navigation**: Clear navigation patterns with entity-specific dashboards
- **Interactive Components**: Rich forms, data tables, and status management interfaces

### Real-Time Data Management
- **Dynamic Status Updates**: Real-time application and job status tracking
- **Live Analytics**: Up-to-date statistics and performance metrics
- **Instant Notifications**: User feedback and status change notifications

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager

### Installation & Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/rahulcharvekar/ManpowerManagement.git
   cd ManpowerManagement/Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open the application**
   Navigate to [http://localhost:5173](http://localhost:5173) in your browser

### Project Structure
```
src/
├── App.tsx                 # Main application component with routing logic
├── components/
│   ├── LandingPage.tsx     # Entity selection landing page
│   ├── WorkerDashboard.tsx # Worker interface and functionality
│   ├── EmployerDashboard.tsx # Employer interface and functionality
│   └── BoardDashboard.tsx  # Administrative interface
├── styles.css              # Global styles and component styling
└── main.tsx               # Application entry point
```

## Usage

### Landing Page
- Select your role (Worker, Employer, or Board Member) to access the appropriate dashboard
- Each role provides different functionality and data access levels

### Worker Features
- **Job Discovery**: Browse and filter available job opportunities
- **Application Management**: Apply to jobs and track application status
- **Profile Setup**: Complete profile with skills, experience, and documents

### Employer Features  
- **Job Creation**: Post new job opportunities with detailed requirements
- **Candidate Pipeline**: Review applications and manage hiring process
- **Team Analytics**: Track hiring success and candidate quality metrics

### Board Administration
- **User Oversight**: Manage worker and employer accounts
- **System Monitoring**: Track platform usage, job success rates, and user activity
- **Configuration**: Set platform policies, limits, and operational parameters

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder ready for deployment.

## Technology Stack

- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety and enhanced developer experience
- **Vite**: Fast development server and optimized production builds
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **PostCSS**: CSS processing with autoprefixer for browser compatibility
- **ES2022**: Modern JavaScript features for clean, maintainable code

## Backend Integration

The frontend is designed to integrate with a REST API backend. Expected endpoints include:

### Worker API
- `GET /api/jobs` - Fetch available job listings
- `POST /api/applications` - Submit job applications
- `GET /api/worker/applications` - Get worker's applications

### Employer API  
- `POST /api/jobs` - Create new job postings
- `GET /api/employer/jobs` - Get employer's job postings
- `GET /api/applications/{jobId}` - Get applications for a job

### Board API
- `GET /api/admin/users` - Get all platform users
- `GET /api/admin/analytics` - Get system analytics
- `PUT /api/admin/users/{id}` - Update user status

## Styling with Tailwind CSS

This project uses Tailwind CSS for styling, providing:

### ✨ **Benefits**
- **Utility-First**: Build complex designs with small, composable utility classes
- **Responsive Design**: Built-in responsive modifiers (sm:, md:, lg:, xl:)
- **Custom Design System**: Extended color palette and animations for brand consistency
- **Developer Experience**: IntelliSense support and faster development

### 🎨 **Custom Configuration**
The project includes a custom Tailwind configuration with:
- **Extended Color Palette**: Primary, secondary, success, warning, and danger color schemes
- **Custom Animations**: Fade-in, slide-up, and bounce-in animations
- **Custom Components**: Pre-built component classes using `@apply` directive

### 📱 **Responsive Breakpoints**
- `sm:` - 640px and up
- `md:` - 768px and up  
- `lg:` - 1024px and up
- `xl:` - 1280px and up

### 🔧 **Usage Examples**
```jsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Custom button with hover effects
<button className="btn-primary hover:shadow-xl transition-shadow">

// Animated card
<div className="card animate-fade-in hover:transform hover:-translate-y-1">
```

## Development Notes

- The current implementation uses mock data for demonstration purposes
- Replace mock data with actual API calls when integrating with a backend
- Component state management is handled with React hooks
- Form validation and error handling are implemented throughout
- Responsive design ensures compatibility across device sizes
- Tailwind CSS classes provide consistent styling and responsive behavior

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
