import React, { useState, useEffect } from 'react';
import ActionGate from '../core/ActionGate';
import { API_ENDPOINTS, apiClient } from '../../api/apiConfig';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    general: {
      systemName: 'Manpower Management System',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      language: 'en',
      maxFileSize: 10, // MB
      allowedFileTypes: ['.xlsx', '.xls', '.csv']
    },
    security: {
      sessionTimeout: 30, // minutes
      passwordMinLength: 8,
      requireSpecialChars: true,
      maxLoginAttempts: 5,
      lockoutDuration: 15 // minutes
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      webhookEnabled: false,
      adminNotifications: true,
      userNotifications: true
    },
    payment: {
      batchSize: 100,
      processingWindow: '09:00-17:00',
      autoApprovalLimit: 10000, // INR
      reconciliationSchedule: 'daily'
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      // In a real implementation, this would fetch from backend
      // const response = await apiClient.get(API_ENDPOINTS.SYSTEM.SETTINGS, token);
      // setSettings(response);
      
      // Simulate API call
      setTimeout(() => setLoading(false), 1000);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      // In a real implementation, this would save to backend
      // await apiClient.put(API_ENDPOINTS.SYSTEM.SETTINGS, settings, token);
      
      // Simulate API call
      setTimeout(() => {
        setSaving(false);
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaving(false);
      setMessage('Failed to save settings: ' + error.message);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      fetchSettings();
      setMessage('Settings reset to default values');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'notifications', name: 'Notifications', icon: '📧' },
    { id: 'payment', name: 'Payment', icon: '💳' }
  ];

  if (loading) {
    return (
      <div className="system-settings-page">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="lg:col-span-3 h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="system-settings-page">
      {/* Page Header */}
      <div className="page-header flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            ⚙️ <span className="ml-2">System Settings</span>
          </h1>
          <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
        </div>
        
        <div className="flex space-x-3">
          <ActionGate componentKey="system-settings" action="EDIT">
            <button 
              onClick={handleReset}
              disabled={saving}
              className="btn btn-secondary"
            >
              Reset to Default
            </button>
          </ActionGate>
          
          <ActionGate componentKey="system-settings" action="MANAGE">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>💾 Save Settings</>
              )}
            </button>
          </ActionGate>
        </div>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div className={`alert mb-6 ${message.includes('Failed') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      {/* Settings Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
            </div>
            <nav className="p-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 mb-1 rounded-lg text-left transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg mr-3">{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6">
              
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">General Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        System Name
                      </label>
                      <input
                        type="text"
                        value={settings.general.systemName}
                        onChange={(e) => updateSetting('general', 'systemName', e.target.value)}
                        className="form-input w-full"
                        placeholder="Enter system name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.general.timezone}
                        onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                        className="form-select w-full"
                      >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="UTC">UTC</option>
                        <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Format
                      </label>
                      <select
                        value={settings.general.dateFormat}
                        onChange={(e) => updateSetting('general', 'dateFormat', e.target.value)}
                        className="form-select w-full"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max File Size (MB)
                      </label>
                      <input
                        type="number"
                        value={settings.general.maxFileSize}
                        onChange={(e) => updateSetting('general', 'maxFileSize', parseInt(e.target.value))}
                        className="form-input w-full"
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                        className="form-input w-full"
                        min="5"
                        max="480"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password Min Length
                      </label>
                      <input
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                        className="form-input w-full"
                        min="6"
                        max="32"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="requireSpecialChars"
                          checked={settings.security.requireSpecialChars}
                          onChange={(e) => updateSetting('security', 'requireSpecialChars', e.target.checked)}
                          className="form-checkbox h-5 w-5 text-primary-600"
                        />
                        <label htmlFor="requireSpecialChars" className="ml-2 text-sm text-gray-700">
                          Require special characters in passwords
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Notification Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Send notifications via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailEnabled}
                        onChange={(e) => updateSetting('notifications', 'emailEnabled', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-primary-600"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                        <p className="text-sm text-gray-600">Send notifications via SMS</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.smsEnabled}
                        onChange={(e) => updateSetting('notifications', 'smsEnabled', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-primary-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Batch Size
                      </label>
                      <input
                        type="number"
                        value={settings.payment.batchSize}
                        onChange={(e) => updateSetting('payment', 'batchSize', parseInt(e.target.value))}
                        className="form-input w-full"
                        min="10"
                        max="1000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Auto Approval Limit (₹)
                      </label>
                      <input
                        type="number"
                        value={settings.payment.autoApprovalLimit}
                        onChange={(e) => updateSetting('payment', 'autoApprovalLimit', parseInt(e.target.value))}
                        className="form-input w-full"
                        min="1000"
                        step="1000"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
