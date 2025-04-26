import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'sonner';

interface AddStudentFormProps {
  onStudentAdded: () => void;
}

const AddStudentForm: React.FC<AddStudentFormProps> = ({ onStudentAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    membership_start: '',
    membership_end: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate only required fields (email is now optional)
      if (!formData.name || !formData.membership_start || !formData.membership_end) {
        toast.error('Please fill all required fields');
        return;
      }

      const response = await api.addStudent({
        ...formData,
        status: 'active',
      });

      if (response && response.student) {
        toast.success('Student added successfully!');
        onStudentAdded();
        setFormData({
          name: '',
          email: '',
          phone: '',
          membership_start: '',
          membership_end: '',
        });
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error: any) {
      console.error('Error adding student:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add student. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-6">Add New Student</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <div>
            <label htmlFor="membership_start" className="block text-sm font-medium text-gray-700 mb-1">
              Membership Start Date *
            </label>
            <input
              type="date"
              id="membership_start"
              name="membership_start"
              value={formData.membership_start}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              required
            />
          </div>

          <div>
            <label htmlFor="membership_end" className="block text-sm font-medium text-gray-700 mb-1">
              Membership End Date *
            </label>
            <input
              type="date"
              id="membership_end"
              name="membership_end"
              value={formData.membership_end}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              required
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 mr-4 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-70"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Add Student'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudentForm;