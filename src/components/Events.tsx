import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import { ADMIN_BASE_URL } from '../constants/api';
import { AddEventModal } from './events/AddEventModal';
import { EditEventModal } from './events/EditEventModal';
import { DeleteModal } from './events/DeleteModal';
import { Event, EventsApiResponse, PaginationData, EventFormData } from './events/types';

export function Events() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get<EventsApiResponse>(`${ADMIN_BASE_URL}/events`, {
        params: {
          page,
          per_page: 30
        },
        headers: {
          'Accept': 'application/json'
        }
      });
      setEvents(response.data.data.events);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError('Failed to fetch events. Please try again later.');
      console.error('Error fetching events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(currentPage);
  }, [currentPage]);

  const handleAddEvent = async (eventData: EventFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('name', eventData.name);
      formData.append('type_id', eventData.eventType!.id);
      formData.append('date', eventData.date);
      formData.append('time', eventData.time);
      formData.append('duration', eventData.duration);
      formData.append('church_id', eventData.church!.id);
      if (eventData.location) {
        formData.append('location_id', eventData.location.id);
      }
      formData.append('frequency_id', eventData.frequency!.id);
      formData.append('notes', eventData.notes);
      
      const response = await axios.post(`${ADMIN_BASE_URL}/events/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });
      
      if (response.data.status === 'success' || response.status === 200 || response.status === 201) {
        await fetchEvents(currentPage);
        setShowAddModal(false);
      } else {
        throw new Error(response.data.message || 'Failed to create event');
      }
    } catch (err: any) {
      let errorMessage = 'Failed to create event. Please try again.';
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

  const handleEditEvent = async (eventData: EventFormData) => {
    if (!editingEvent) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('id', editingEvent.id);
      formData.append('name', eventData.name);
      formData.append('type_id', eventData.eventType!.id);
      formData.append('date', eventData.date);
      formData.append('time', eventData.time);
      formData.append('duration', eventData.duration);
      formData.append('church_id', eventData.church!.id);
      if (eventData.location) {
        formData.append('location_id', eventData.location.id);
      }
      formData.append('frequency_id', eventData.frequency!.id);
      formData.append('notes', eventData.notes);
      
      const response = await axios.post(`${ADMIN_BASE_URL}/events/edit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });
      
      if (response.data.status === 'success' || response.status === 200 || response.status === 201) {
        await fetchEvents(currentPage);
        setEditingEvent(null);
      } else {
        throw new Error(response.data.message || 'Failed to update event');
      }
    } catch (err: any) {
      let errorMessage = 'Failed to update event. Please try again.';
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

  const handleDeleteConfirm = async () => {
    if (!selectedEvent) return;
    
    try {
      setIsDeleting(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('id', selectedEvent.id);
      
      const response = await axios.post(`${ADMIN_BASE_URL}/events/delete`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });
      
      if (response.data.status === 'success' || response.status === 200 || response.status === 201) {
        await fetchEvents(currentPage);
        setSelectedEvent(null);
      } else {
        throw new Error(response.data.message || 'Failed to delete event');
      }
    } catch (err: any) {
      let errorMessage = 'Failed to delete event. Please try again later.';
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
  };

  const getPageNumbers = (currentPage: number, totalPages: number) => {
    const maxPages = 5;
    const pages: number[] = [];
    
    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 2) {
        end = 3;
      }
      if (currentPage >= totalPages - 1) {
        start = totalPages - 2;
      }
      
      if (start > 2) {
        pages.push(-1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push(-1);
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const formatDateTime = (date: string, time: string, duration: string) => {
  const eventDate = new Date(date);

  // Get weekday (e.g., Sunday)
  const dayOfWeek = eventDate.toLocaleDateString('en-GB', {
    weekday: 'long'
  });

  // Get UK date (e.g., 09/06/2025)
  const ukFormattedDate = eventDate.toLocaleDateString('en-GB');

  // Parse time and format
  const [hours, minutes] = time.split(':');
  const timeObj = new Date();
  timeObj.setHours(parseInt(hours), parseInt(minutes));
  const formattedTime = timeObj.toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return {
    dayOfWeek,
    ukFormattedDate,
    timeWithDuration: `${formattedTime} (${duration}min)`
  };
};


  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.type_name && event.type_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (event.church_name && event.church_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (event.notes && event.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading && !events.length) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Events</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Events</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              fetchEvents(currentPage);
            }}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Events</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Schedule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Church
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{event.name}</div>
                  {event.frequency_name && (
                    <div className="text-xs text-gray-500">{event.frequency_name}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {event.type_name && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {event.type_name}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
  {(() => {
    const { dayOfWeek, ukFormattedDate, timeWithDuration } = formatDateTime(event.date, event.time, event.duration);
    return (
      <div className="text-sm text-gray-900 space-y-1">
        <div>{dayOfWeek}</div>
        <div>{ukFormattedDate}</div>
        <div>{timeWithDuration}</div>
      </div>
    );
  })()}
</td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{event.church_name || '-'}</div>
                  {event.location_name && (
                    <div className="text-xs text-gray-500">{event.location_name}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {event.notes || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingEvent(event)}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedEvent(event)}
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

        {pagination && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                disabled={!pagination.has_prev_page}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(page => Math.min(page + 1, pagination.total_pages))}
                disabled={!pagination.has_next_page}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {getPageNumbers(pagination.current_page, pagination.total_pages).map((page, index) => (
                    page === -1 ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    ) : (
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
                    )
                  ))}
                  <button
                    onClick={() => setCurrentPage(page => Math.min(page + 1, pagination.total_pages))}
                    disabled={!pagination.has_next_page}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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

      {selectedEvent && (
        <DeleteModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      )}

      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onConfirm={handleEditEvent}
          isSubmitting={isSubmitting}
        />
      )}

      {showAddModal && (
        <AddEventModal
          onClose={() => setShowAddModal(false)}
          onConfirm={handleAddEvent}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}