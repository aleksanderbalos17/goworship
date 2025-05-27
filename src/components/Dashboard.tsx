import React, { useState } from 'react';
import { LayoutDashboard, Users, Music, Settings, LogOut } from 'lucide-react';
import { Users as UsersPage } from './Users';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'users' | 'songs' | 'settings'>('dashboard');
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');

  const renderContent = () => {
    switch (currentPage) {
      case 'users':
        return <UsersPage />;
      case 'dashboard':
        return (
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Users</h3>
                <p className="text-3xl font-bold text-indigo-600">1,234</p>
                <p className="text-sm text-gray-500 mt-2">+12% from last month</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Songs</h3>
                <p className="text-3xl font-bold text-indigo-600">567</p>
                <p className="text-sm text-gray-500 mt-2">+5% from last month</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Sessions</h3>
                <p className="text-3xl font-bold text-indigo-600">89</p>
                <p className="text-sm text-gray-500 mt-2">Current active users</p>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">New song added: "Amazing Grace"</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                    <span className="text-xs text-indigo-600 font-medium">View</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return <div className="p-8">Content coming soon...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">GoWorship</h2>
          <p className="text-sm text-gray-500 mt-1">{admin.email}</p>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`flex items-center space-x-3 w-full text-left px-4 py-2 rounded-lg ${
                  currentPage === 'dashboard'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentPage('users')}
                className={`flex items-center space-x-3 w-full text-left px-4 py-2 rounded-lg ${
                  currentPage === 'users'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Users</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentPage('songs')}
                className={`flex items-center space-x-3 w-full text-left px-4 py-2 rounded-lg ${
                  currentPage === 'songs'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Music className="w-5 h-5" />
                <span>Songs</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentPage('settings')}
                className={`flex items-center space-x-3 w-full text-left px-4 py-2 rounded-lg ${
                  currentPage === 'settings'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </li>
          </ul>
          <button
            onClick={onLogout}
            className="flex items-center space-x-3 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg mt-8 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
}