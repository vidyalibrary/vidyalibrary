import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { User } from 'lucide-react';
import api from '../services/api';

interface UserData {
  id: number;
  username: string;
  fullName: string;
  email: string;
}

interface UserProfile {
  user: UserData;
}

interface ProfileUpdateData {
  full_name: string;
  email: string;
}

interface PasswordUpdateData {
  current_password: string;
  new_password: string;
}

interface EmailSettingsData {
  templateId: string | null;
  daysBefore: string | null;
}

const Settings = () => {
  const queryClient = useQueryClient();

  const { data: userProfile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: api.getUserProfile,
  });

  const { data: emailSettings, isLoading: emailLoading } = useQuery<EmailSettingsData>({
    queryKey: ['emailSettings'],
    queryFn: api.getEmailSettings,
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [emailFormData, setEmailFormData] = useState({
    templateId: '',
    daysBefore: '',
  });

  useEffect(() => {
    if (userProfile && userProfile.user) {
      setFormData((prev) => ({
        ...prev,
        fullName: userProfile.user.fullName || '',
        email: userProfile.user.email || '',
      }));
    }
  }, [userProfile]);

  useEffect(() => {
    if (emailSettings) {
      setEmailFormData({
        templateId: emailSettings.templateId || '',
        daysBefore: emailSettings.daysBefore || '',
      });
    }
  }, [emailSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmailSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const profileMutation = useMutation({
    mutationFn: (data: ProfileUpdateData) => api.updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordUpdateData) => api.updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Password changed successfully!');
      setFormData((prev) => ({
        ...prev,
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change password');
    },
  });

  const emailSettingsMutation = useMutation({
    mutationFn: (data: { templateId: string; daysBefore: string }) => api.updateEmailSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailSettings'] });
      toast.success('Email settings updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update email settings');
    },
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: ProfileUpdateData = {
      full_name: formData.fullName,
      email: formData.email,
    };
    profileMutation.mutate(updateData);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    const updateData: PasswordUpdateData = {
      current_password: formData.oldPassword,
      new_password: formData.newPassword,
    };
    passwordMutation.mutate(updateData);
  };

  const handleEmailSettingsUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailFormData.templateId || !emailFormData.daysBefore) {
      toast.error('Please fill all email settings fields');
      return;
    }
    emailSettingsMutation.mutate({
      templateId: emailFormData.templateId,
      daysBefore: emailFormData.daysBefore,
    });
  };

  if (profileLoading || emailLoading) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
              <p className="text-gray-500">Manage your account settings and preferences</p>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Profile Information</h3>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="h-12 w-12 text-purple-500" />
                      </div>
                      <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 rounded-full">
                        Change
                      </Button>
                    </div>
                  </div>
                  <form onSubmit={handleProfileUpdate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-medium">
                          Full Name
                        </label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName || ''}
                          onChange={handleChange}
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email Address
                        </label>
                        <Input
                          id="email"
                          name="email"
                          value={formData.email || ''}
                          onChange={handleChange}
                          type="email"
                          placeholder="Your email address"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Change Password</h3>
                </div>
                <div className="p-5">
                  <form onSubmit={handlePasswordUpdate}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="oldPassword" className="text-sm font-medium">
                          Current Password
                        </label>
                        <Input
                          id="oldPassword"
                          name="oldPassword"
                          value={formData.oldPassword}
                          onChange={handleChange}
                          type="password"
                          placeholder="Enter your current password"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="newPassword" className="text-sm font-medium">
                          New Password
                        </label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          type="password"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium">
                          Confirm New Password
                        </label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          type="password"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button type="submit">Update Password</Button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Email Settings</h3>
                </div>
                <div className="p-5">
                  <form onSubmit={handleEmailSettingsUpdate}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="templateId" className="text-sm font-medium">
                          Email Template ID (Brevo)
                        </label>
                        <Input
                          id="templateId"
                          name="templateId"
                          value={emailFormData.templateId}
                          onChange={handleEmailSettingsChange}
                          placeholder="Enter Brevo template ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="daysBefore" className="text-sm font-medium">
                          Days Before Expiry
                        </label>
                        <Input
                          id="daysBefore"
                          name="daysBefore"
                          value={emailFormData.daysBefore}
                          onChange={handleEmailSettingsChange}
                          type="number"
                          placeholder="Number of days before expiry to send email"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button type="submit">Save Email Settings</Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;