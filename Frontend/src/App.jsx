import { useState } from "react";
import { WorkerDashboard } from "./components/WorkerDashboard.jsx";
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
      return <WorkerDashboard onGoBack={handleGoBack} />;
    default:
      return <LandingPage onEntitySelect={handleEntitySelect} />;
  }
}

export default App;
