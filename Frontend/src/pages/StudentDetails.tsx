import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { toast } from 'sonner';
import { Trash2, ArrowLeft, Edit, Save, X } from 'lucide-react';

// Interface for student data, matching camelCase keys from the API response
interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  membershipStart: string | null;
  membershipEnd: string | null;
}

// Utility function to format date for display (e.g., YYYY-MM-DD or "N/A")
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'N/A' : date.toISOString().split('T')[0];
};

// Utility function to format date for input fields (e.g., YYYY-MM-DD or empty string)
const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
};

const StudentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Student | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await api.getStudent(id!);
        const studentData = response.student;
        if (!studentData) {
          throw new Error('Student data not found in response');
        }
        console.log('Fetched student data:', studentData); // Debug log to inspect the response

        const updatedStudent = {
          ...studentData,
          membershipStart: studentData.membershipStart || null,
          membershipEnd: studentData.membershipEnd || null,
        };
        setStudent(updatedStudent);
        setLoading(false);
      } catch (error: any) {
        console.error('Failed to fetch student details:', error.message);
        toast.error('Failed to load student details');
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  const handleEdit = () => {
    if (student) {
      setFormData({
        ...student,
        membershipStart: student.membershipStart || null,
        membershipEnd: student.membershipEnd || null,
      });
      setEditMode(true);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData(null);
  };

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        membershipStart: formData.membershipStart || null,
        membershipEnd: formData.membershipEnd || null,
      };
      console.log('Update data being sent:', updateData); // Debug log to inspect the update payload
      const response = await api.updateStudent(id!, updateData);
      const updatedStudent = {
        ...response.student,
        membershipStart: response.student.membershipStart || null,
        membershipEnd: response.student.membershipEnd || null,
      };
      setStudent(updatedStudent);
      setEditMode(false);
      toast.success('Student updated successfully');
    } catch (error: any) {
      console.error('Failed to update student:', error.message);
      toast.error(error.response?.data?.message || 'Failed to update student');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.deleteStudent(id!);
        toast.success('Student deleted successfully');
        navigate('/students');
      } catch (error: any) {
        console.error('Failed to delete student:', error.message);
        toast.error('Failed to delete student');
      }
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading student details...</div>;
  if (!student) return <div className="flex justify-center p-8">Student not found</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center text-purple-600 hover:text-purple-800"
            >
              <ArrowLeft size={16} className="mr-1" /> Back
            </button>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Student Details</h1>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-medium text-gray-500">Name</h2>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData!.name}
                        onChange={(e) => setFormData({ ...formData!, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    ) : (
                      <p className="text-lg">{student.name}</p>
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-gray-500">Email</h2>
                    {editMode ? (
                      <input
                        type="email"
                        value={formData!.email}
                        onChange={(e) => setFormData({ ...formData!, email: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    ) : (
                      <p className="text-lg">{student.email}</p>
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-gray-500">Phone</h2>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData!.phone || ''}
                        onChange={(e) => setFormData({ ...formData!, phone: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    ) : (
                      <p className="text-lg">{student.phone || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-gray-500">Status</h2>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {student.status === 'active' ? 'Active' : 'Expired'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-gray-500">Membership Start</h2>
                    {editMode ? (
                      <input
                        type="date"
                        value={formatDateForInput(formData!.membershipStart)}
                        readOnly
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    ) : (
                      <p className="text-lg">{formatDate(student.membershipStart)}</p>
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-gray-500">Membership End</h2>
                    {editMode ? (
                      <input
                        type="date"
                        value={formatDateForInput(formData!.membershipEnd)}
                        readOnly
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    ) : (
                      <p className="text-lg">{formatDate(student.membershipEnd)}</p>
                    )}
                  </div>
                  <div className="flex space-x-4 mt-6">
                    {editMode ? (
                      <>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                        >
                          <Save size={16} className="mr-2" /> {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          <X size={16} className="mr-2" /> Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleEdit}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Edit size={16} className="mr-2" /> Edit
                      </button>
                    )}
                    <button
                      onClick={handleDelete}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 size={16} className="mr-2" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;