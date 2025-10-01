import { useState } from 'react';
import WorkerFileUploadScreen from './WorkerFileUploadScreen';
import WorkerGenerateRequestScreen from './WorkerGenerateRequestScreen';
import WorkerPaymentScreen from './WorkerPaymentScreen';
import WorkerUploadedFilesListScreen from './WorkerUploadedFilesListScreen';
import WorkerProcessPaymentScreen from './WorkerProcessPaymentScreen';
import WorkerPaymentDetailsScreen from './WorkerPaymentDetailsScreen';
import { uploadWorkerPaymentFile, validateFileBeforeUpload } from '../api/workerPayments.js';

function NewWorkerDashboard({ onGoBack }) {
  const [currentScreen, setCurrentScreen] = useState('dashboard'); // 'dashboard', 'upload-file', 'requests', 'payment', 'process-payment', 'uploaded-files-list', 'payment-details'
  
  // Upload popup state
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle', 'uploading', 'success', 'error'
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Navigate to Upload File section
  const handleNavigateToUploadFile = () => {
    setShowUploadPopup(true);
  };

  // Navigate to View Uploaded Files List
  const handleNavigateToUploadedFilesList = () => {
    setCurrentScreen('uploaded-files-list');
  };

  // Navigate to Requests section
  const handleNavigateToRequests = () => {
    setCurrentScreen('requests');
  };

  // Navigate to Payment section
  const handleNavigateToPayment = () => {
    setCurrentScreen('payment');
  };

  // Navigate to Process Payment section
  const handleNavigateToProcessPayment = () => {
    setCurrentScreen('process-payment');
  };

  // Navigate to Payment Details section
  const handleNavigateToPaymentDetails = () => {
    setCurrentScreen('payment-details');
  };

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  // Handle file upload popup
  const handleCloseUploadPopup = () => {
    setShowUploadPopup(false);
    setUploadFile(null);
    setUploadStatus('idle');
    setUploadMessage('');
    setUploadProgress(0);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setUploadStatus('error');
        setUploadMessage('Please select a valid Excel (.xls, .xlsx) or CSV file');
        return;
      }

      // Check file size (200MB limit)
      if (file.size > 200 * 1024 * 1024) {
        setUploadStatus('error');
        setUploadMessage('File size should not exceed 200MB');
        return;
      }

      setUploadFile(file);
      setUploadStatus('idle');
      setUploadMessage('');
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      setUploadStatus('error');
      setUploadMessage('Please select a file first');
      return;
    }

    try {
      setUploadStatus('uploading');
      setUploadMessage('Uploading file...');
      setUploadProgress(0);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 200);

      const response = await uploadWorkerPaymentFile(uploadFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response && response.message) {
        setUploadStatus('success');
        setUploadMessage(response.message);
      } else {
        setUploadStatus('success');
        setUploadMessage('File uploaded successfully!');
      }

      // Auto close popup after 2 seconds
      setTimeout(() => {
        handleCloseUploadPopup();
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadMessage(error.message || 'Failed to upload file. Please try again.');
      setUploadProgress(0);
    }
  };

  // Render main dashboard view
  const renderDashboardView = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <div className="bg-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={onGoBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Worker Dashboard</h1>
                  <p className="text-sm text-gray-600">Manage your payment files and requests</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700">Worker</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Upload File Section */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Upload File</h2>
                    <p className="text-blue-100">Upload & validate files</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <a 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigateToUploadFile();
                      }}
                      className="text-blue-600 text-sm hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                    >
                      Upload Excel/CSV files
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <a 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigateToUploadedFilesList();
                      }}
                      className="text-blue-600 text-sm hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                    >
                      View uploaded files
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Requests Section */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Requests</h2>
                    <p className="text-green-100">Generate payment requests</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <a 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigateToRequests();
                      }}
                      className="text-green-600 text-sm hover:text-green-800 hover:underline transition-colors cursor-pointer"
                    >
                      Generate Payment Request
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <a 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigateToProcessPayment();
                      }}
                      className="text-green-600 text-sm hover:text-green-800 hover:underline transition-colors cursor-pointer"
                    >
                      Process Payment Request
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Payment</h2>
                    <p className="text-purple-100">Manage payments</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <a 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigateToPaymentDetails();
                      }}
                      className="text-purple-600 text-sm hover:text-purple-800 hover:underline transition-colors cursor-pointer"
                    >
                      View payment details
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Stats Section */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">--</div>
                    <div className="text-sm text-gray-600 mt-1">Files Uploaded</div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-600">--</div>
                    <div className="text-sm text-gray-600 mt-1">Requests Generated</div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-purple-600">₹--</div>
                    <div className="text-sm text-gray-600 mt-1">Payment Amount</div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render upload popup
  const renderUploadPopup = () => {
    if (!showUploadPopup) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Upload File</h3>
            <button
              onClick={handleCloseUploadPopup}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* File Upload Area */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Excel or CSV file
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={uploadStatus === 'uploading'}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">
                  Click to select a file or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Excel (.xlsx, .xls) or CSV files, max 200MB
                </p>
              </label>
            </div>
          </div>

          {/* Selected File Info */}
          {uploadFile && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-blue-800 font-medium">{uploadFile.name}</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Size: {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}

          {/* Upload Progress */}
          {uploadStatus === 'uploading' && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Uploading...</span>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Status Message */}
          {uploadMessage && (
            <div className={`mb-4 p-3 rounded-lg ${
              uploadStatus === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : uploadStatus === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              <div className="flex items-center gap-2">
                {uploadStatus === 'success' && (
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {uploadStatus === 'error' && (
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className="text-sm">{uploadMessage}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCloseUploadPopup}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={uploadStatus === 'uploading'}
            >
              Cancel
            </button>
            <button
              onClick={handleFileUpload}
              disabled={!uploadFile || uploadStatus === 'uploading' || uploadStatus === 'success'}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                !uploadFile || uploadStatus === 'uploading' || uploadStatus === 'success'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render current screen
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return renderDashboardView();
      
      case 'upload-file':
        return (
          <WorkerFileUploadScreen 
            onGoBack={handleBackToDashboard}
          />
        );
      
      case 'uploaded-files-list':
        return (
          <WorkerUploadedFilesListScreen 
            onGoBack={handleBackToDashboard}
          />
        );
      
      case 'requests':
        return (
          <WorkerGenerateRequestScreen 
            onNavigateToPaymentScreen={() => {
              // After generating requests, suggest going to Payment
              alert('Requests generated successfully! You can view them in Payment section.');
              handleBackToDashboard();
            }}
            onGoBack={handleBackToDashboard}
          />
        );
      
      case 'payment':
        return (
          <WorkerPaymentScreen 
            onGoBack={handleBackToDashboard}
          />
        );
      
      case 'process-payment':
        return (
          <WorkerProcessPaymentScreen 
            onGoBack={handleBackToDashboard}
          />
        );
      
      case 'payment-details':
        return (
          <WorkerPaymentDetailsScreen 
            onGoBack={handleBackToDashboard}
          />
        );
      
      default:
        return renderDashboardView();
    }
  };

  return (
    <>
      {renderCurrentScreen()}
      {renderUploadPopup()}
    </>
  );
}

export default NewWorkerDashboard;
