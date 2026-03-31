import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { shiftAPI, locationAPI, taskAPI, uploadAPI } from '../services/api';
import HomeButton from '../components/HomeButton';

function CompanySetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);
  const [companyData, setCompanyData] = useState({
    name: '',
    industry: '',
    size: '',
    description: ''
  });
  const [invitationData, setInvitationData] = useState({
    emails: [''],
    role: 'employee',
    message: ''
  });

  useEffect(() => {
    // Check if user already has a company
    const checkCompanyStatus = async () => {
      try {
        const response = await ApiService.getCompanyStatus();
        if (response.company) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.log('No company found, proceeding with setup');
      }
    };
    
    checkCompanyStatus();
  }, [navigate]);

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await ApiService.createCompany(companyData);
      setSuccess('Company created successfully! Now invite your team members.');
      setStep(2);
    } catch (error) {
      setError(error.message || 'Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (index, value) => {
    const newEmails = [...invitationData.emails];
    newEmails[index] = value;
    setInvitationData({ ...invitationData, emails: newEmails });
  };

  const addEmailField = () => {
    setInvitationData({ ...invitationData, emails: [...invitationData.emails, ''] });
  };

  const removeEmailField = (index) => {
    const newEmails = invitationData.emails.filter((_, i) => i !== index);
    setInvitationData({ ...invitationData, emails: newEmails });
  };

  const handleInvitationSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const validEmails = invitationData.emails.filter(email => email.trim());
      
      if (validEmails.length === 0) {
        setError('Please add at least one email address');
        setLoading(false);
        return;
      }

      const invitations = validEmails.map(email => ({
        email: email.trim(),
        role: invitationData.role,
        message: invitationData.message
      }));

      const response = await ApiService.sendInvitations(invitations);
      setSuccess(`Invitations sent to ${validEmails.length} team members! They will receive an email with instructions to join your company.`);
      
      // Redirect to dashboard after successful invitations
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      setError(error.message || 'Failed to send invitations');
    } finally {
      setLoading(false);
    }
  };

  const skipInvitations = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {step === 1 ? 'Create Your Company' : 'Invite Team Members'}
          </h2>
          <HomeButton />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step === 1 ? 'text-blue-600' : 'text-green-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 1 ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
              }`}>
                {step === 1 ? '1' : '✓'}
              </div>
              <span className="ml-2 font-medium">Company Setup</span>
            </div>
            <div className={`flex items-center ${step === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Invite Team</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: step === 1 ? '50%' : '100%' }}
              />
            </div>
          </div>
        </div>

        {step === 1 ? (
          // Company Setup Form
          <div className="bg-white py-8 px-6 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleCompanySubmit}>
              <div>
                <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <div className="mt-1">
                  <input
                    id="company-name"
                    name="company-name"
                    type="text"
                    required
                    value={companyData.name}
                    onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your company name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                  Industry
                </label>
                <div className="mt-1">
                  <select
                    id="industry"
                    name="industry"
                    value={companyData.industry}
                    onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select an industry</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="education">Education</option>
                    <option value="hospitality">Hospitality</option>
                    <option value="construction">Construction</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                  Company Size
                </label>
                <div className="mt-1">
                  <select
                    id="size"
                    name="size"
                    value={companyData.size}
                    onChange={(e) => setCompanyData({ ...companyData, size: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description (Optional)
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={companyData.description}
                    onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of your company"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Creating Company...' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          // Invitation Form
          <div className="bg-white py-8 px-6 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleInvitationSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Member Emails
                </label>
                {invitationData.emails.map((email, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email address"
                    />
                    {invitationData.emails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEmailField(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEmailField}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Add another email
                </button>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Default Role
                </label>
                <div className="mt-1">
                  <select
                    id="role"
                    name="role"
                    value={invitationData.role}
                    onChange={(e) => setInvitationData({ ...invitationData, role: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Personal Message (Optional)
                </label>
                <div className="mt-1">
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    value={invitationData.message}
                    onChange={(e) => setInvitationData({ ...invitationData, message: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a personal message to the invitation email..."
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Sending Invitations...' : 'Send Invitations'}
                </button>
                <button
                  type="button"
                  onClick={skipInvitations}
                  className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Skip for Now
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanySetup;
