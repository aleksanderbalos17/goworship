import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import axios from 'axios';
import { ADMIN_BASE_URL } from '../constants/api';

interface EventFrequency {
  id: string;
  name: string;
  active: string;
  notes: string;
  showme: string;
  created_at: string;
  updated_at: string | null;
}

interface PaginationData {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

interface ApiResponse {
  status: string;
  data: {
    frequencies: EventFrequency[];
    pagination: PaginationData;
  };
}

interface DeleteModalProps {
  eventFrequency: EventFrequency;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

interface EditModalProps {
  eventFrequency: EventFrequency;
  onClose: () => void;
  onConfirm: (name: string, notes: string, active: boolean, showme: boolean) => Promise<void>;
  isSubmitting: boolean;
}

interface AddModalProps {
  onClose: () => void;
  onConfirm: (name: string, notes: string, active: boolean, showme: boolean) => Promise<void>;
  isSubmitting: boolean;
}

function DeleteModal({ eventFrequency, onClose, onConfirm, isDeleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Event Frequency</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{eventFrequency.name}"? This action cannot be undone.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm()}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 order-1 sm:order-2"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ eventFrequency, onClose, onConfirm, isSubmitting }: EditModalProps) {
  const [name, setName] = useState(eventFrequency.name);
  const [notes, setNotes] = useState(eventFrequency.notes);
  const [active, setActive] = useState(eventFrequency.active === "1");
  const [showme, setShowme] = useState(eventFrequency.showme === "1");
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    try {
      await onConfirm(name, notes, active, showme);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update event frequency');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Event Frequency</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter frequency name"
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <input
                type="text"
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter additional notes"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showme"
                  checked={showme}
                  onChange={(e) => setShowme(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="showme" className="ml-2 block text-sm text-gray-700">
                  Show Me
                </label>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 order-1 sm:order-2"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddModal({ onClose, onConfirm, isSubmitting }: AddModalProps) {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);
  const [showme, setShowme] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    try {
      await onConfirm(name, notes, active, showme);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create event frequency');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Event Frequency</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter frequency name"
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <input
                type="text"
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter additional notes"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showme"
                  checked={showme}
                  onChange={(e) => setShowme(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="showme" className="ml-2 block text-sm text-gray-700">
                  Show Me
                </label>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 order-1 sm:order-2"
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EventFrequencies() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventFrequency, setSelectedEventFrequency] = useState<EventFrequency | null>(null);
  const [editingEventFrequency, setEditingEventFrequency] = useState<EventFrequency | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [eventFrequencies, setEventFrequencies] = useState<EventFrequency[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventFrequencies = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get<ApiResponse>(`${ADMIN_BASE_URL}/event-frequencies`, {
        params: {
          page,
          per_page: 10
        },
        headers: {
          'Accept': 'application/json'
        }
      });
      setEventFrequencies(response.data.data.frequencies);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError('Failed to fetch event frequencies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEventFrequency = async (name: string, notes: string, active: boolean, showme: boolean) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Create FormData object for form-data request
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('notes', notes.trim());
      formData.append('active', active.toString());
      formData.append('showme', showme.toString());
      
      const response = await axios.post(`${ADMIN_BASE_URL}/event-frequencies/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });
      
      // Check if the response indicates success
      if (response.data.status === 'success' || response.status === 200 || response.status === 201) {
        await fetchEventFrequencies(currentPage);
        setShowAddModal(false);
      } else {
        throw new Error(response.data.message || 'Failed to create event frequency');
      }
    } catch (err: any) {
      // Extract error message from response
      let errorMessage = 'Failed to create event frequency. Please try again.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEventFrequency = async (name: string, notes: string, active: boolean, showme: boolean) => {
    if (editingEventFrequency) {
      try {
        setIsSubmitting(true);
        setError(null);
        
        // Create FormData object for form-data request
        const formData = new FormData();
        formData.append('id', editingEventFrequency.id);
        formData.append('name', name.trim());
        formData.append('notes', notes.trim());
        formData.append('active', active.toString());
        formData.append('showme', showme.toString());
        
        const response = await axios.post(
          `${ADMIN_BASE_URL}/event-frequencies/edit`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Accept': 'application/json'
            }
          }
        );
        
        // Check if the response indicates success
        if (response.data.status === 'success' || response.status === 200 || response.status === 201) {
          await fetchEventFrequencies(currentPage);
          setEditingEventFrequency(null);
        } else {
          throw new Error(response.data.message || 'Failed to update event frequency');
        }
      } catch (err: any) {
        // Extract error message from response
        let errorMessage = 'Failed to update event frequency. Please try again.';
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedEventFrequency) {
      try {
        setIsDeleting(true);
        setError(null);
        
        // Create FormData object for form-data request
        const formData = new FormData();
        formData.append('id', selectedEventFrequency.id);
        
        const response = await axios.post(`${ADMIN_BASE_URL}/event-frequencies/delete`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          }
        });
        
        // Check if the response indicates success
        if (response.data.status === 'success' || response.status === 200 || response.status === 201) {
          await fetchEventFrequencies(currentPage);
          setSelectedEventFrequency(null);
        } else {
          throw new Error(response.data.message || 'Failed to delete event frequency');
        }
      } catch (err: any) {
        // Extract error message from response
        let errorMessage = 'Failed to delete event frequency. Please try again later.';
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const toggleActive = async (id: string) => {
    try {
      await axios.put(`${ADMIN_BASE_URL}/event-frequencies/${id}/toggle-active`, null, {
        headers: {
          'Accept': 'application/json'
        }
      });
      await fetchEventFrequencies(currentPage);
    } catch (err) {
      setError('Failed to update status. Please try again later.');
    }
  };

  const toggleShowme = async (id: string) => {
    try {
      await axios.put(`${ADMIN_BASE_URL}/event-frequencies/${id}/toggle-showme`, null, {
        headers: {
          'Accept': 'application/json'
        }
      });
      await fetchEventFrequencies(currentPage);
    } catch (err) {
      setError('Failed to update status. Please try again later.');
    }
  };

  useEffect(() => {
    fetchEventFrequencies(currentPage);
  }, [currentPage]);

  const filteredEventFrequencies = eventFrequencies.filter(frequency => 
    frequency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    frequency.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !eventFrequencies.length) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-semibold text-gray-800">Event Frequencies</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-semibold text-gray-800">Event Frequencies</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Event Frequencies</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search frequencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Add Frequency</span>
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block xl:hidden space-y-4">
        {filteredEventFrequencies.map((frequency) => (
          <div key={frequency.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 truncate">{frequency.name}</h3>
                {frequency.notes && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 font-medium mb-1">Notes:</p>
                    <p className="text-sm text-gray-500 break-words leading-relaxed">{frequency.notes}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Active:</span>
                  <button
                    onClick={() => toggleActive(frequency.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      frequency.active === "1"
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                  >
                    {frequency.active === "1" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Show:</span>
                  <button
                    onClick={() => toggleShowme(frequency.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      frequency.showme === "1"
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                  >
                    {frequency.showme === "1" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingEventFrequency(frequency)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedEventFrequency(frequency)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden xl:block bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">Notes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Show Me</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEventFrequencies.map((frequency) => (
                <tr key={frequency.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap w-1/6">
                    <div className="text-sm font-medium text-gray-900">{frequency.name}</div>
                  </td>
                  <td className="px-6 py-4 w-2/5">
                    <div className="text-sm text-gray-500 break-words max-w-xs xl:max-w-sm 2xl:max-w-md leading-relaxed">
                      {frequency.notes}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap w-1/12">
                    <button
                      onClick={() => toggleActive(frequency.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        frequency.active === "1"
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      {frequency.active === "1" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap w-1/12">
                    <button
                      onClick={() => toggleShowme(frequency.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        frequency.showme === "1"
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      {frequency.showme === "1" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm w-1/6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingEventFrequency(frequency)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedEventFrequency(frequency)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                disabled={!pagination.has_prev_page}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(page => Math.min(page + 1, pagination.total_pages))}
                disabled={!pagination.has_next_page}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.current_page - 1) * pagination.per_page + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                    disabled={!pagination.has_prev_page}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.current_page
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(page => Math.min(page + 1, pagination.total_pages))}
                    disabled={!pagination.has_next_page}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Pagination */}
      {pagination && (
        <div className="block xl:hidden mt-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
              disabled={!pagination.has_prev_page}
              className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            
            <span className="text-sm text-gray-700">
              Page {pagination.current_page} of {pagination.total_pages}
            </span>
            
            <button
              onClick={() => setCurrentPage(page => Math.min(page + 1, pagination.total_pages))}
              disabled={!pagination.has_next_page}
              className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-700">
              Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{' '}
              {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
              {pagination.total} results
            </p>
          </div>
        </div>
      )}

      {selectedEventFrequency && (
        <DeleteModal
          eventFrequency={selectedEventFrequency}
          onClose={() => setSelectedEventFrequency(null)}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      )}

      {editingEventFrequency && (
        <EditModal
          eventFrequency={editingEventFrequency}
          onClose={() => setEditingEventFrequency(null)}
          onConfirm={handleEditEventFrequency}
          isSubmitting={isSubmitting}
        />
      )}

      {showAddModal && (
        <AddModal
          onClose={() => setShowAddModal(false)}
          onConfirm={handleAddEventFrequency}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}