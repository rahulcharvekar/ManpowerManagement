import { useState } from "react";
import { WorkerDashboard } from "./components/WorkerDashboard.jsx";
import NewWorkerDashboard from "./components/NewWorkerDashboard.jsx";
import EmployerDashboard from "./components/EmployerDashboard.jsx";
import BoardDashboard from "./components/BoardDashboard.jsx";
import { LandingPage } from "./components/LandingPage.jsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import AuthContainer from "./components/AuthContainer.jsx";

// Main App Content Component
function AppContent() {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const { isAuthenticated, user, logout, loading } = useAuth();

  const handleEntitySelect = (entity) => {
    // If user is not authenticated, show auth modal first
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setSelectedEntity(entity);
  };

  const handleGoBack = () => {
    setSelectedEntity(null);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    // After successful auth, you might want to redirect based on user role
    if (user?.role) {
      setSelectedEntity(user.role.toLowerCase());
    }
  };

  const handleLogout = async () => {
    await logout();
    setSelectedEntity(null);
    setShowAuth(false);
  };

  // Show loading spinner during auth initialization
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Loading Manpower Management System...</p>
        </div>
      </div>
    );
  }

  // Show auth modal if requested
  if (showAuth && !isAuthenticated) {
    return (
      <>
        <LandingPage 
          onEntitySelect={handleEntitySelect} 
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          user={user}
        />
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Authentication Required</h2>
                <button
                  onClick={() => setShowAuth(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <AuthContainer onAuthSuccess={handleAuthSuccess} />
            </div>
          </div>
        </div>
      </>
    );
  }

  // Landing page with entity selection
  if (!selectedEntity) {
    return (
      <LandingPage 
        onEntitySelect={handleEntitySelect}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        user={user}
      />
    );
  }

  // Render appropriate dashboard based on selected entity
  switch (selectedEntity) {
    case "worker":
      return (
        <NewWorkerDashboard 
          onGoBack={handleGoBack}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          user={user}
        />
      );
    case "worker-old":
      return (
        <WorkerDashboard 
          onGoBack={handleGoBack}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          user={user}
        />
      );
    case "employer":
      return (
        <EmployerDashboard 
          onGoBack={handleGoBack}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          user={user}
        />
      );
    case "board":
      return (
        <BoardDashboard 
          onGoBack={handleGoBack}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          user={user}
        />
      );
    default:
      return (
        <LandingPage 
          onEntitySelect={handleEntitySelect}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          user={user}
        />
      );
  }
}

// Main App Component with Auth Provider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
