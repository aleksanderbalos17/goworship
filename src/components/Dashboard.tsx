import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Book, Dribbble as Bible, Settings, LogOut, Church, Building2, Calendar, ChevronDown, CalendarDays, Menu, X } from 'lucide-react';
import axios from 'axios';
import { ADMIN_BASE_URL } from '../constants/api';
import { Users as UsersPage } from './Users';
import { Books } from './Books';
import { Bibles } from './Bibles';
import { Churches } from './Churches';
import { Denominations } from './Denominations';
import { EventTypes } from './EventTypes';
import { EventFrequencies } from './EventFrequencies';
import { Events } from './Events';

interface DashboardProps {
  onLogout: () => void;
}

interface ApiResponse {
  status: string;
  data: {
    users: any[];
    pagination: {
      total: number;
    };
  };
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState<
    'dashboard' | 'events' | 'users' | 'books' | 'bibles' | 'churches' | 'denominations' | 'event-types' | 'event-frequencies' | 'settings'
  >('dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [eventsMenuOpen, setEventsMenuOpen] = useState(false);
  const [booksMenuOpen, setBooksMenuOpen] = useState(false);
  const [churchesMenuOpen, setChurchesMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');

  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const response = await axios.get<ApiResponse>(`${ADMIN_BASE_URL}/users`, {
          params: {
            page: 1,
            per_page: 1
          },
          headers: {
            'Accept': 'application/json'
          }
        });
        setTotalUsers(response.data.data.pagination.total);
      } catch (error) {
        console.error('Error fetching total users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentPage === 'dashboard') {
      fetchTotalUsers();
    }
  }, [currentPage]);

  const handleLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'events':
        return <Events />;
      case 'users':
        return <UsersPage />;
      case 'books':
        return <Books />;
      case 'bibles':
        return <Bibles />;
      case 'churches':
        return <Churches />;
      case 'denominations':
        return <Denominations />;
      case 'event-types':
        return <EventTypes />;
      case 'event-frequencies':
        return <EventFrequencies />;
      case 'dashboard':
        return (
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Users</h3>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 mt-2"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-indigo-600">{totalUsers.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-2">Registered Users</p>
                  </>
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Books</h3>
                <p className="text-3xl font-bold text-indigo-600">66</p>
                <p className="text-sm text-gray-500 mt-2">Complete Bible Books</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Verses</h3>
                <p className="text-3xl font-bold text-indigo-600">31,102</p>
                <p className="text-sm text-gray-500 mt-2">Bible Verses</p>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">New verse added: Genesis 1:{i}</p>
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
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-20 w-10 h-10 rounded-lg bg-white shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg flex flex-col transition-transform duration-300 ease-in-out`}>
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">GoWorship</h2>
          <p className="text-sm text-gray-500 mt-1">{admin.email}</p>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
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
                onClick={() => setCurrentPage('events')}
                className={`flex items-center space-x-3 w-full text-left px-4 py-2 rounded-lg ${
                  currentPage === 'events'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CalendarDays className="w-5 h-5" />
                <span>All Events</span>
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
            <li className="relative">
              <button
                onClick={() => setBooksMenuOpen(!booksMenuOpen)}
                className={`flex items-center justify-between w-full text-left px-4 py-2 rounded-lg ${
                  currentPage === 'books' || currentPage === 'bibles'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Book className="w-5 h-5" />
                  <span>Books</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${booksMenuOpen ? 'transform rotate-180' : ''}`} />
              </button>
              {booksMenuOpen && (
                <ul className="pl-12 mt-2 space-y-2">
                  <li>
                    <button
                      onClick={() => setCurrentPage('books')}
                      className={`w-full text-left py-2 text-sm ${
                        currentPage === 'books'
                          ? 'text-indigo-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Books
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setCurrentPage('bibles')}
                      className={`w-full text-left py-2 text-sm ${
                        currentPage === 'bibles'
                          ? 'text-indigo-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Bibles
                    </button>
                  </li>
                </ul>
              )}
            </li>
            <li className="relative">
              <button
                onClick={() => setChurchesMenuOpen(!churchesMenuOpen)}
                className={`flex items-center justify-between w-full text-left px-4 py-2 rounded-lg ${
                  currentPage === 'churches' || currentPage === 'denominations'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Church className="w-5 h-5" />
                  <span>Churches</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${churchesMenuOpen ? 'transform rotate-180' : ''}`} />
              </button>
              {churchesMenuOpen && (
                <ul className="pl-12 mt-2 space-y-2">
                  <li>
                    <button
                      onClick={() => setCurrentPage('churches')}
                      className={`w-full text-left py-2 text-sm ${
                        currentPage === 'churches'
                          ? 'text-indigo-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Churches
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setCurrentPage('denominations')}
                      className={`w-full text-left py-2 text-sm ${
                        currentPage === 'denominations'
                          ? 'text-indigo-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Denominations
                    </button>
                  </li>
                </ul>
              )}
            </li>
            <li className="relative">
              <button
                onClick={() => setEventsMenuOpen(!eventsMenuOpen)}
                className={`flex items-center justify-between w-full text-left px-4 py-2 rounded-lg ${
                  currentPage === 'event-types' || currentPage === 'event-frequencies'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5" />
                  <span>Events</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${eventsMenuOpen ? 'transform rotate-180' : ''}`} />
              </button>
              {eventsMenuOpen && (
                <ul className="pl-12 mt-2 space-y-2">
                  <li>
                    <button
                      onClick={() => setCurrentPage('event-types')}
                      className={`w-full text-left py-2 text-sm ${
                        currentPage === 'event-types'
                          ? 'text-indigo-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Event Types
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setCurrentPage('event-frequencies')}
                      className={`w-full text-left py-2 text-sm ${
                        currentPage === 'event-frequencies'
                          ? 'text-indigo-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Event Frequencies
                    </button>
                  </li>
                </ul>
              )}
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
        </nav>
        <div className="p-4 mt-auto border-t">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center space-x-3 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {renderContent()}
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}