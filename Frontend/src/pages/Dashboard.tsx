import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronRight, Users, UserCheck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import StudentList from '../components/StudentList';
import AddStudentForm from '../components/AddStudentForm';
import ExpiringMemberships from '../components/ExpiringMemberships';
import api from '../services/api';

// Utility function to format date to YYYY-MM-DD
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toISOString().split('T')[0];
};

const Dashboard = () => {
  const [updateList, setUpdateList] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    expiredMemberships: 0,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  const handleStudentAdded = () => {
    setUpdateList(!updateList);
    setShowAddForm(false);
    fetchStats();
  };

  const fetchStats = async () => {
    try {
      const response = await api.getStudents();
      const students = response.students;
      const currentDate = new Date();
      setStats({
        totalStudents: students.length,
        activeStudents: students.filter((s: any) => {
          const membershipEndDate = new Date(s.membershipEnd);
          return membershipEndDate >= currentDate && s.status === 'active';
        }).length,
        expiredMemberships: students.filter((s: any) => {
          const membershipEndDate = new Date(s.membershipEnd);
          return membershipEndDate < currentDate;
        }).length,
      });
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        console.error('Failed to fetch stats:', error.message);
        toast.error('Failed to load dashboard stats');
      }
    }
  };

  useEffect(() => {
    fetchStats();
  }, [updateList, navigate]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-500">Welcome to your admin dashboard</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link to="/students" className="block">
                <StatCard
                  title="Total Students"
                  value={stats.totalStudents}
                  icon={<Users size={20} className="text-purple-600" />}
                  iconBgColor="bg-purple-100"
                  arrowIcon={<ChevronRight size={18} className="text-purple-400" />}
                />
              </Link>
              <Link to="/active-students" className="block">
                <StatCard
                  title="Active Students"
                  value={stats.activeStudents}
                  icon={<UserCheck size={20} className="text-blue-600" />}
                  iconBgColor="bg-blue-100"
                  arrowIcon={<ChevronRight size={18} className="text-blue-400" />}
                />
              </Link>
              <Link to="/expired-memberships" className="block">
                <StatCard
                  title="Expired Memberships"
                  value={stats.expiredMemberships}
                  icon={<AlertTriangle size={20} className="text-orange-600" />}
                  iconBgColor="bg-orange-100"
                  arrowIcon={<ChevronRight size={18} className="text-orange-400" />}
                />
              </Link>
            </div>
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Students</h2>
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  {showAddForm ? 'Cancel' : 'Add Student'}
                </button>
              </div>
              {showAddForm ? (
                <div className="mb-6">
                  <AddStudentForm onStudentAdded={handleStudentAdded} />
                </div>
              ) : (
                <StudentList key={updateList.toString()} limit={5} />
              )}
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Expiring Soon</h2>
              <ExpiringMemberships limit={5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;