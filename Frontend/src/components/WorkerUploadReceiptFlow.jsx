import { useState } from 'react';
import WorkerFileUploadScreen from './WorkerFileUploadScreen';
import WorkerGenerateRequestScreen from './WorkerGenerateRequestScreen_1';

function WorkerUploadReceiptFlow({ onGoBack }) {
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload', 'generate'

  // Navigate to Generate Request step
  const handleNavigateToGenerateRequest = () => {
    setCurrentStep('generate');
  };

  // Navigate back to Upload step
  const handleBackToUpload = () => {
    setCurrentStep('upload');
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <WorkerFileUploadScreen 
            onNavigateToGenerateRequest={handleNavigateToGenerateRequest}
          />
        );
      
      case 'generate':
        return (
          <WorkerGenerateRequestScreen 
            onNavigateToPaymentScreen={() => {
              // After generating request, go back to dashboard instead of payment screen
              alert('Request generated successfully! You can view it in Payment Management.');
              onGoBack();
            }}
            onGoBack={handleBackToUpload}
          />
        );
      
      default:
        return (
          <WorkerFileUploadScreen 
            onNavigateToGenerateRequest={handleNavigateToGenerateRequest}
          />
        );
    }
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb Navigation for Upload & Receipt Flow */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <button
              onClick={onGoBack}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Dashboard
            </button>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            
            <button
              onClick={handleBackToUpload}
              className={`transition-colors ${
                currentStep === 'upload' 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              File Upload & Validation
            </button>
            
            {currentStep === 'generate' && (
              <>
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-green-600 font-medium">Generate Receipt Request</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main Step Content */}
      {renderCurrentStep()}
    </div>
  );
}

export default WorkerUploadReceiptFlow;
