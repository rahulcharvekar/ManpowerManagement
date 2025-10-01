import { useState } from "react";
import { WorkerDashboard } from "./components/WorkerDashboard.jsx";
import NewWorkerDashboard from "./components/NewWorkerDashboard.jsx";
import EmployerDashboard from "./components/EmployerDashboard.jsx";
import BoardDashboard from "./components/BoardDashboard.jsx";
import { LandingPage } from "./components/LandingPage.jsx";

function App() {
  const [selectedEntity, setSelectedEntity] = useState(null);

  const handleEntitySelect = (entity) => {
    setSelectedEntity(entity);
  };

  const handleGoBack = () => {
    setSelectedEntity(null);
  };

  // Landing page with entity selection
  if (!selectedEntity) {
    return <LandingPage onEntitySelect={handleEntitySelect} />;
  }

  // Render appropriate dashboard based on selected entity
  switch (selectedEntity) {
    case "worker":
      return <NewWorkerDashboard onGoBack={handleGoBack} />;
    case "worker-old":
      return <WorkerDashboard onGoBack={handleGoBack} />;
    case "employer":
      return <EmployerDashboard onGoBack={handleGoBack} />;
    case "board":
      return <BoardDashboard onGoBack={handleGoBack} />;
    default:
      return <LandingPage onEntitySelect={handleEntitySelect} />;
  }
}

export default App;
