import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2, Plus, ChevronDown, X } from 'lucide-react';
import axios from 'axios';
import { ADMIN_BASE_URL } from '../constants/api';

interface Event {
  id: string;
  name: string;
  type_id: string;
  type_name: string;
  date: string;
  time: string;
  duration: number;
  church_id: string;
  church_name: string;
  location_id: string;
  frequency_id: string;
  frequency_name: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface EventFrequency {
  id: string;
  name: string;
  active: string;
  notes: string;
  showme: string;
  created_at: string;
  updated_at: string | null;
}

interface Church {
  id: string;
  name: string;
  photo_url: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  created_at: string;
  updated_at: string;
  speakers: string | null;
  denomination_id: string;
}

interface ChurchLocation {
  id: string;
  church_id: string;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  created_at: string;
  updated_at: string;
}

interface EventType {
  id: string;
  name: string;
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
    events: Event[];
    pagination: PaginationData;
  };
}

interface DeleteModalProps {
  event: Event;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

interface EditModalProps {
  event: Event;
  onClose: () => void;
  onConfirm: (eventData: any) => Promise<void>;
  isSubmitting: boolean;
  eventFrequencies: EventFrequency[];
  churches: Church[];
  eventTypes: EventType[];
  churchLocations: ChurchLocation[];
}

interface AddModalProps {
  onClose: () => void;
  onConfirm: (eventData: any) => Promise<void>;
  isSubmitting: boolean;
  eventFrequencies: EventFrequency[];
  churches: Church[];
  eventTypes: EventType[];
  churchLocations: ChurchLocation[];
}

function DeleteModal({ event, onClose, onConfirm, isDeleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Event</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{event.name}"? This action cannot be undone.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm()}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ event, onClose, onConfirm, isSubmitting, eventFrequencies, churches, eventTypes, churchLocations }: EditModalProps) {
  const [name, setName] = useState(event.name);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [eventTypeSearch, setEventTypeSearch] = useState('');
  const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(event.date);
  const [selectedTime, setSelectedTime] = useState(event.time);
  const [duration, setDuration] = useState(event.duration);
  const [selectedFrequency, setSelectedFrequency] = useState<EventFrequency | null>(null);
  const [frequencySearch, setFrequencySearch] = useState('');
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [churchSearch, setChurchSearch] = useState('');
  const [showChurchDropdown, setShowChurchDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<ChurchLocation | null>(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [notes, setNotes] = useState(event.notes);
  const [error, setError] = useState('');

  // Initialize form with current event data
  useEffect(() => {
    // Set event type
    const eventType = eventTypes.find(type => type.id === event.type_id);
    if (eventType) {
      setSelectedEventType(eventType);
      setEventTypeSearch(eventType.name);
    }

    // Set frequency
    const frequency = eventFrequencies.find(freq => freq.id === event.frequency_id);
    if (frequency) {
      setSelectedFrequency(frequency);
      setFrequencySearch(frequency.name);
    }

    // Set church
    const church = churches.find(c => c.id === event.church_id);
    if (church) {
      setSelectedChurch(church);
      setChurchSearch(church.name);
    }

    // Set location if available
    if (event.location_id && event.location_id !== '0') {
      const location = churchLocations.find(loc => loc.id === event.location_id);
      if (location) {
        setSelectedLocation(location);
        setLocationSearch(location.name);
      }
    }
  }, [event, eventTypes, eventFrequencies, churches, churchLocations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Event name is required');
      return;
    }
    if (!selectedEventType) {
      setError('Please select an event type');
      return;
    }
    if (!selectedFrequency) {
      setError('Please select an event frequency');
      return;
    }
    if (!selectedChurch) {
      setError('Please select a church');
      return;
    }
    try {
      await onConfirm({
        id: event.id,
        name: name.trim(),
        type_id: selectedEventType.id,
        date: selectedDate,
        time: selectedTime,
        duration: duration.toString(),
        church_id: selectedChurch.id,
        location_id: selectedLocation?.id || '0',
        frequency_id: selectedFrequency.id,
        notes: notes.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update event');
    }
  };

  // Filter event types based on search term and sort by name
  const filteredEventTypes = eventTypes
    .filter(type => 
      type.name.toLowerCase().includes(eventTypeSearch.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  // Filter active frequencies that should be shown
  const filteredFrequencies = eventFrequencies.filter(freq => 
    freq.active === "1" && 
    freq.showme === "1" &&
    freq.name.toLowerCase().includes(frequencySearch.toLowerCase())
  );

  // Filter churches based on search term
  const filteredChurches = churches.filter(church => 
    church.name.toLowerCase().includes(churchSearch.toLowerCase())
  );

  // Filter locations for selected church
  const filteredLocations = selectedChurch 
    ? churchLocations.filter(location => 
        location.church_id === selectedChurch.id &&
        location.name.toLowerCase().includes(locationSearch.toLowerCase())
      )
    : [];

  const handleEventTypeSelect = (eventType: EventType) => {
    setSelectedEventType(eventType);
    setEventTypeSearch(eventType.name);
    setShowEventTypeDropdown(false);
  };

  const handleEventTypeSearchChange = (value: string) => {
    setEventTypeSearch(value);
    setShowEventTypeDropdown(true);
    if (!value) {
      setSelectedEventType(null);
    }
  };

  const handleFrequencySelect = (frequency: EventFrequency) => {
    setSelectedFrequency(frequency);
    setFrequencySearch(frequency.name);
    setShowFrequencyDropdown(false);
  };

  const handleFrequencySearchChange = (value: string) => {
    setFrequencySearch(value);
    setShowFrequencyDropdown(true);
    if (!value) {
      setSelectedFrequency(null);
    }
  };

  const handleChurchSelect = (church: Church) => {
    setSelectedChurch(church);
    setChurchSearch(church.name);
    setShowChurchDropdown(false);
    // Reset location when church changes
    setSelectedLocation(null);
    setLocationSearch('');
  };

  const handleChurchSearchChange = (value: string) => {
    setChurchSearch(value);
    setShowChurchDropdown(true);
    if (!value) {
      setSelectedChurch(null);
      setSelectedLocation(null);
      setLocationSearch('');
    }
  };

  const handleLocationSelect = (location: ChurchLocation) => {
    setSelectedLocation(location);
    setLocationSearch(location.name);
    setShowLocationDropdown(false);
  };

  const handleLocationSearchChange = (value: string) => {
    setLocationSearch(value);
    setShowLocationDropdown(true);
    if (!value) {
      setSelectedLocation(null);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.event-type-dropdown-container')) {
        setShowEventTypeDropdown(false);
      }
      if (!target.closest('.frequency-dropdown-container')) {
        setShowFrequencyDropdown(false);
      }
      if (!target.closest('.church-dropdown-container')) {
        setShowChurchDropdown(false);
      }
      if (!target.closest('.location-dropdown-container')) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold text-gray-900">Edit Event</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Row 1: Event Name / Event Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter event name"
                />
              </div>

              <div className="relative event-type-dropdown-container">
                <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="eventType"
                    value={eventTypeSearch}
                    onChange={(e) => handleEventTypeSearchChange(e.target.value)}
                    onFocus={() => setShowEventTypeDropdown(true)}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Search and select event type"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  
                  {showEventTypeDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <div className="max-h-40 overflow-y-auto">
                        {filteredEventTypes.length > 0 ? (
                          filteredEventTypes.map((eventType) => (
                            <button
                              key={eventType.id}
                              type="button"
                              onClick={() => handleEventTypeSelect(eventType)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{eventType.name}</div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500 text-center">
                            {eventTypeSearch ? 'No event types found' : 'Start typing to search event types'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: Date and Time / Duration / Frequency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-2">
                  Date and Time
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    id="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="time"
                    id="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  min="15"
                  step="15"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="relative frequency-dropdown-container">
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="frequency"
                    value={frequencySearch}
                    onChange={(e) => handleFrequencySearchChange(e.target.value)}
                    onFocus={() => setShowFrequencyDropdown(true)}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Search and select frequency"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  
                  {showFrequencyDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <div className="max-h-40 overflow-y-auto">
                        {filteredFrequencies.length > 0 ? (
                          filteredFrequencies.map((frequency) => (
                            <button
                              key={frequency.id}
                              type="button"
                              onClick={() => handleFrequencySelect(frequency)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{frequency.name}</div>
                              {frequency.notes && (
                                <div className="text-sm text-gray-500 mt-1">{frequency.notes}</div>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500 text-center">
                            {frequencySearch ? 'No frequencies found' : 'Start typing to search frequencies'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Church / Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="relative church-dropdown-container">
                <label htmlFor="church" className="block text-sm font-medium text-gray-700 mb-2">
                  Church
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="church"
                    value={churchSearch}
                    onChange={(e) => handleChurchSearchChange(e.target.value)}
                    onFocus={() => setShowChurchDropdown(true)}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Search and select a church"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  
                  {showChurchDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <div className="max-h-40 overflow-y-auto">
                        {filteredChurches.length > 0 ? (
                          filteredChurches.map((church) => (
                            <button
                              key={church.id}
                              type="button"
                              onClick={() => handleChurchSelect(church)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{church.name}</div>
                              {church.address && (
                                <div className="text-sm text-gray-500 mt-1">{church.address}</div>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500 text-center">
                            {churchSearch ? 'No churches found' : 'Start typing to search churches'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative location-dropdown-container">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="location"
                    value={locationSearch}
                    onChange={(e) => handleLocationSearchChange(e.target.value)}
                    onFocus={() => setShowLocationDropdown(true)}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={selectedChurch ? "Search locations for this church" : "Select a church first"}
                    disabled={!selectedChurch}
                  />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  
                  {showLocationDropdown && selectedChurch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <div className="max-h-40 overflow-y-auto">
                        {filteredLocations.length > 0 ? (
                          filteredLocations.map((location) => (
                            <button
                              key={location.id}
                              type="button"
                              onClick={() => handleLocationSelect(location)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{location.name}</div>
                              {location.address && (
                                <div className="text-sm text-gray-500 mt-1">{location.address}</div>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500 text-center">
                            {locationSearch ? 'No locations found' : 'No locations available for this church'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {selectedChurch && (
                  <p className="mt-1 text-sm text-gray-500">
                    {filteredLocations.length} location(s) available for {selectedChurch.name}
                  </p>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter additional notes, special instructions, or event description"
              />
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
              >
                {isSubmitting ? 'Updating...' : 'Update Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function AddModal({ onClose, onConfirm, isSubmitting, eventFrequencies, churches, eventTypes, churchLocations }: AddModalProps) {
  const [name, setName] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [eventTypeSearch, setEventTypeSearch] = useState('');
  const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [duration, setDuration] = useState(60);
  const [selectedFrequency, setSelectedFrequency] = useState<EventFrequency | null>(null);
  const [frequencySearch, setFrequencySearch] = useState('');
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [churchSearch, setChurchSearch] = useState('');
  const [showChurchDropdown, setShowChurchDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<ChurchLocation | null>(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Event name is required');
      return;
    }
    if (!selectedEventType) {
      setError('Please select an event type');
      return;
    }
    if (!selectedFrequency) {
      setError('Please select an event frequency');
      return;
    }
    if (!selectedChurch) {
      setError('Please select a church');
      return;
    }
    try {
      await onConfirm({
        name: name.trim(),
        type_id: selectedEventType.id,
        date: selectedDate,
        time: selectedTime,
        duration: duration.toString(),
        church_id: selectedChurch.id,
        location_id: selectedLocation?.id || '0',
        frequency_id: selectedFrequency.id,
        notes: notes.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    }
  };

  // Filter event types based on search term and sort by name
  const filteredEventTypes = eventTypes
    .filter(type => 
      type.name.toLowerCase().includes(eventTypeSearch.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  // Filter active frequencies that should be shown
  const filteredFrequencies = eventFrequencies.filter(freq => 
    freq.active === "1" && 
    freq.showme === "1" &&
    freq.name.toLowerCase().includes(frequencySearch.toLowerCase())
  );

  // Filter churches based on search term
  const filteredChurches = churches.filter(church => 
    church.name.toLowerCase().includes(churchSearch.toLowerCase())
  );

  // Filter locations for selected church
  const filteredLocations = selectedChurch 
    ? churchLocations.filter(location => 
        location.church_id === selectedChurch.id &&
        location.name.toLowerCase().includes(locationSearch.toLowerCase())
      )
    : [];

  const handleEventTypeSelect = (eventType: EventType) => {
    setSelectedEventType(eventType);
    setEventTypeSearch(eventType.name);
    setShowEventTypeDropdown(false);
  };

  const handleEventTypeSearchChange = (value: string) => {
    setEventTypeSearch(value);
    setShowEventTypeDropdown(true);
    if (!value) {
      setSelectedEventType(null);
    }
  };

  const handleFrequencySelect = (frequency: EventFrequency) => {
    setSelectedFrequency(frequency);
    setFrequencySearch(frequency.name);
    setShowFrequencyDropdown(false);
  };

  const handleFrequencySearchChange = (value: string) => {
    setFrequencySearch(value);
    setShowFrequencyDropdown(true);
    if (!value) {
      setSelectedFrequency(null);
    }
  };

  const handleChurchSelect = (church: Church) => {
    setSelectedChurch(church);
    setChurchSearch(church.name);
    setShowChurchDropdown(false);
    // Reset location when church changes
    setSelectedLocation(null);
    setLocationSearch('');
  };

  const handleChurchSearchChange = (value: string) => {
    setChurchSearch(value);
    setShowChurchDropdown(true);
    if (!value) {
      setSelectedChurch(null);
      setSelectedLocation(null);
      setLocationSearch('');
    }
  };

  const handleLocationSelect = (location: ChurchLocation) => {
    setSelectedLocation(location);
    setLocationSearch(location.name);
    setShowLocationDropdown(false);
  };

  const handleLocationSearchChange = (value: string) => {
    setLocationSearch(value);
    setShowLocationDropdown(true);
    if (!value) {
      setSelectedLocation(null);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.event-type-dropdown-container')) {
        setShowEventTypeDropdown(false);
      }
      if (!target.closest('.frequency-dropdown-container')) {
        setShowFrequencyDropdown(false);
      }
      if (!target.closest('.church-dropdown-container')) {
        setShowChurchDropdown(false);
      }
      if (!target.closest('.location-dropdown-container')) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold text-gray-900">Add New Event</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Row 1: Event Name / Event Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter event name"
                />
              </div>

              <div className="relative event-type-dropdown-container">
                <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="eventType"
                    value={eventTypeSearch}
                    onChange={(e) => handleEventTypeSearchChange(e.target.value)}
                    onFocus={() => setShowEventTypeDropdown(true)}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Search and select event type"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  
                  {showEventTypeDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <div className="max-h-40 overflow-y-auto">
                        {filteredEventTypes.length > 0 ? (
                          filteredEventTypes.map((eventType) => (
                            <button
                              key={eventType.id}
                              type="button"
                              onClick={() => handleEventTypeSelect(eventType)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{eventType.name}</div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500 text-center">
                            {eventTypeSearch ? 'No event types found' : 'Start typing to search event types'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: Date and Time / Duration / Frequency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-2">
                  Date and Time
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    id="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="time"
                    id="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  min="15"
                  step="15"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="relative frequency-dropdown-container">
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="frequency"
                    value={frequencySearch}
                    onChange={(e) => handleFrequencySearchChange(e.target.value)}
                    onFocus={() => setShowFrequencyDropdown(true)}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Search and select frequency"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  
                  {showFrequencyDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <div className="max-h-40 overflow-y-auto">
                        {filteredFrequencies.length > 0 ? (
                          filteredFrequencies.map((frequency) => (
                            <button
                              key={frequency.id}
                              type="button"
                              onClick={() => handleFrequencySelect(frequency)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{frequency.name}</div>
                              {frequency.notes && (
                                <div className="text-sm text-gray-500 mt-1">{frequency.notes}</div>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500 text-center">
                            {frequencySearch ? 'No frequencies found' : 'Start typing to search frequencies'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Church / Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="relative church-dropdown-container">
                <label htmlFor="church" className="block text-sm font-medium text-gray-700 mb-2">
                  Church
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="church"
                    value={churchSearch}
                    onChange={(e) => handleChurchSearchChange(e.target.value)}
                    onFocus={() => setShowChurchDropdown(true)}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Search and select a church"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  
                  {showChurchDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <div className="max-h-40 overflow-y-auto">
                        {filteredChurches.length > 0 ? (
                          filteredChurches.map((church) => (
                            <button
                              key={church.id}
                              type="button"
                              onClick={() => handleChurchSelect(church)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{church.name}</div>
                              {church.address && (
                                <div className="text-sm text-gray-500 mt-1">{church.address}</div>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500 text-center">
                            {churchSearch ? 'No churches found' : 'Start typing to search churches'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative location-dropdown-container">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="location"
                    value={locationSearch}
                    onChange={(e) => handleLocationSearchChange(e.target.value)}
                    onFocus={() => setShowLocationDropdown(true)}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={selectedChurch ? "Search locations for this church" : "Select a church first"}
                    disabled={!selectedChurch}
                  />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  
                  {showLocationDropdown && selectedChurch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <div className="max-h-40 overflow-y-auto">
                        {filteredLocations.length > 0 ? (
                          filteredLocations.map((location) => (
                            <button
                              key={location.id}
                              type="button"
                              onClick={() => handleLocationSelect(location)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{location.name}</div>
                              {location.address && (
                                <div className="text-sm text-gray-500 mt-1">{location.address}</div>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500 text-center">
                            {locationSearch ? 'No locations found' : 'No locations available for this church'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {selectedChurch && (
                  <p className="mt-1 text-sm text-gray-500">
                    {filteredLocations.length} location(s) available for {selectedChurch.name}
                  </p>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter additional notes, special instructions, or event description"
              />
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function Events() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventFrequencies, setEventFrequencies] = useState<EventFrequency[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [churchLocations, setChurchLocations] = useState<ChurchLocation[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events from API
  const fetchEvents = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get<ApiResponse>(`${ADMIN_BASE_URL}/events`, {
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

  // Fetch event types when component mounts
  const fetchEventTypes = async () => {
    try {
      const response = await axios.get(`${ADMIN_BASE_URL}/event-types/all`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      let eventTypesData: EventType[] = [];
      if (response.data.status === 'success' && response.data.data) {
        eventTypesData = response.data.data.event_types || response.data.data;
      } else if (Array.isArray(response.data)) {
        eventTypesData = response.data;
      }
      
      eventTypesData.sort((a, b) => a.name.localeCompare(b.name));
      setEventTypes(eventTypesData);
    } catch (err) {
      console.error('Error fetching event types:', err);
      setEventTypes([]);
    }
  };

  // Fetch event frequencies when component mounts
  const fetchEventFrequencies = async () => {
    try {
      const response = await axios.get(`${ADMIN_BASE_URL}/event-frequencies/all`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.data.status === 'success' && response.data.data) {
        setEventFrequencies(response.data.data.frequencies || response.data.data);
      } else if (Array.isArray(response.data)) {
        setEventFrequencies(response.data);
      }
    } catch (err) {
      console.error('Error fetching event frequencies:', err);
      setEventFrequencies([]);
    }
  };

  // Fetch churches when component mounts
  const fetchChurches = async () => {
    try {
      const response = await axios.get(`${ADMIN_BASE_URL}/churches/all`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.data.status === 'success' && response.data.data) {
        setChurches(response.data.data.churches || response.data.data);
      } else if (Array.isArray(response.data)) {
        setChurches(response.data);
      }
    } catch (err) {
      console.error('Error fetching churches:', err);
      setChurches([]);
    }
  };

  // Fetch church locations when component mounts
  const fetchChurchLocations = async () => {
    try {
      const response = await axios.get(`${ADMIN_BASE_URL}/church-locations/all`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.data.status === 'success' && response.data.data) {
        setChurchLocations(response.data.data.locations || response.data.data);
      } else if (Array.isArray(response.data)) {
        setChurchLocations(response.data);
      }
    } catch (err) {
      console.error('Error fetching church locations:', err);
      setChurchLocations([]);
    }
  };

  useEffect(() => {
    fetchEvents(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchEventTypes();
    fetchEventFrequencies();
    fetchChurches();
    fetchChurchLocations();
  }, []);

  const handleAddEvent = async (eventData: any) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('name', eventData.name);
      formData.append('type_id', eventData.type_id);
      formData.append('date', eventData.date);
      formData.append('time', eventData.time);
      formData.append('duration', eventData.duration);
      formData.append('church_id', eventData.church_id);
      formData.append('location_id', eventData.location_id);
      formData.append('frequency_id', eventData.frequency_id);
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

  const handleEditEvent = async (eventData: any) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('id', eventData.id);
      formData.append('name', eventData.name);
      formData.append('type_id', eventData.type_id);
      formData.append('date', eventData.date);
      formData.append('time', eventData.time);
      formData.append('duration', eventData.duration);
      formData.append('church_id', eventData.church_id);
      formData.append('location_id', eventData.location_id);
      formData.append('frequency_id', eventData.frequency_id);
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
    if (selectedEvent) {
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
    }
  };

  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.church_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.notes.toLowerCase().includes(searchTerm.toLowerCase())
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
            <span>Add New Event</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Church</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{event.name}</div>
                  <div className="text-sm text-gray-500">{event.frequency_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {event.type_name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(event.date)}</div>
                  <div className="text-sm text-gray-500">
                    {formatTime(event.time)} ({event.duration} mins)
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{event.church_name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-xs truncate">{event.notes || '-'}</div>
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
                  {Array.from({ length: Math.min(pagination.total_pages, 10) }, (_, i) => {
                    const page = i + 1;
                    return (
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
                    );
                  })}
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
        <EditModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onConfirm={handleEditEvent}
          isSubmitting={isSubmitting}
          eventFrequencies={eventFrequencies}
          churches={churches}
          eventTypes={eventTypes}
          churchLocations={churchLocations}
        />
      )}

      {showAddModal && (
        <AddModal
          onClose={() => setShowAddModal(false)}
          onConfirm={handleAddEvent}
          isSubmitting={isSubmitting}
          eventFrequencies={eventFrequencies}
          churches={churches}
          eventTypes={eventTypes}
          churchLocations={churchLocations}
        />
      )}
    </div>
  );
}