import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2, Plus, ChevronDown, X } from 'lucide-react';
import axios from 'axios';
import { ADMIN_BASE_URL } from '../constants/api';

interface Event {
  id: string;
  name: string;
  eventType: string;
  day: number;
  time: number;
  duration: number;
  church_id: string;
  location_id: string;
  eventFrequencyId: string;
  additionalText: string;
  churchName: string;
  locationAddress: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  church_id: string;
  created_at: string;
  updated_at: string | null;
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

interface EventType {
  id: string;
  name: string;
  created_at: string;
  updated_at: string | null;
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
  onConfirm: (eventData: Partial<Event>) => Promise<void>;
  isSubmitting: boolean;
}

interface AddModalProps {
  onClose: () => void;
  onConfirm: (eventData: Omit<Event, 'id'>) => Promise<void>;
  isSubmitting: boolean;
  eventFrequencies: EventFrequency[];
  churches: Church[];
  eventTypes: EventType[];
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

function EditModal({ event, onClose, onConfirm, isSubmitting }: EditModalProps) {
  const [name, setName] = useState(event.name);
  const [eventType, setEventType] = useState(event.eventType);
  const [day, setDay] = useState(event.day);
  const [time, setTime] = useState(event.time);
  const [duration, setDuration] = useState(event.duration);
  const [additionalText, setAdditionalText] = useState(event.additionalText);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Event name is required');
      return;
    }
    try {
      await onConfirm({
        name,
        eventType,
        day,
        time,
        duration,
        additionalText
      });
    } catch (err) {
      setError('Failed to update event');
    }
  };

  const formatTimeForInput = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const parseTimeFromInput = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Event</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Event Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter event name"
              />
            </div>

            <div>
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                Event Type
              </label>
              <select
                id="eventType"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Service">Service</option>
                <option value="Prayer Meeting">Prayer Meeting</option>
                <option value="Bible Study">Bible Study</option>
                <option value="Youth Group">Youth Group</option>
              </select>
            </div>

            <div>
              <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                Day of Week
              </label>
              <select
                id="day"
                value={day}
                onChange={(e) => setDay(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </select>
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                id="time"
                value={formatTimeForInput(time)}
                onChange={(e) => setTime(parseTimeFromInput(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                min="15"
                step="15"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="additionalText" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                id="additionalText"
                value={additionalText}
                onChange={(e) => setAdditionalText(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter additional notes"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
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

function AddModal({ onClose, onConfirm, isSubmitting, eventFrequencies, churches, eventTypes }: AddModalProps) {
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
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [additionalText, setAdditionalText] = useState('');
  const [error, setError] = useState('');

  // Fetch locations when church is selected
  const fetchLocations = async (churchId: string) => {
    try {
      setIsLoadingLocations(true);
      const response = await axios.get(`${ADMIN_BASE_URL}/church-locations/all`, {
        params: { church_id: churchId },
        headers: { 'Accept': 'application/json' }
      });
      
      let locationsData: Location[] = [];
      if (response.data.status === 'success' && response.data.data) {
        locationsData = response.data.data.locations || response.data.data;
      } else if (Array.isArray(response.data)) {
        locationsData = response.data;
      }
      
      setLocations(locationsData);
      
      // Auto-select first location if available
      if (locationsData.length > 0) {
        const firstLocation = locationsData[0];
        setSelectedLocation(firstLocation);
        setLocationSearch(firstLocation.name);
      } else {
        setSelectedLocation(null);
        setLocationSearch('');
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
      setLocations([]);
      setSelectedLocation(null);
      setLocationSearch('');
    } finally {
      setIsLoadingLocations(false);
    }
  };

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
    if (!selectedLocation) {
      setError('Please select a location');
      return;
    }
    try {
      // Convert date to day of week (0 = Sunday, 1 = Monday, etc.)
      const eventDate = new Date(selectedDate);
      const dayOfWeek = eventDate.getDay();
      
      // Convert time to minutes
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const timeInMinutes = hours * 60 + minutes;

      await onConfirm({
        name,
        eventType: selectedEventType.name,
        day: dayOfWeek,
        time: timeInMinutes,
        duration,
        church_id: selectedChurch.id,
        location_id: selectedLocation.id,
        eventFrequencyId: selectedFrequency.id,
        additionalText,
        churchName: selectedChurch.name,
        locationAddress: selectedLocation.address
      });
      onClose();
    } catch (err) {
      setError('Failed to create event');
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

  // Filter locations based on search term
  const filteredLocations = locations.filter(location => 
    location.name.toLowerCase().includes(locationSearch.toLowerCase())
  );

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
    
    // Reset location selection and fetch new locations
    setSelectedLocation(null);
    setLocationSearch('');
    fetchLocations(church.id);
  };

  const handleChurchSearchChange = (value: string) => {
    setChurchSearch(value);
    setShowChurchDropdown(true);
    if (!value) {
      setSelectedChurch(null);
      setSelectedLocation(null);
      setLocationSearch('');
      setLocations([]);
    }
  };

  const handleLocationSelect = (location: Location) => {
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
            {/* Event Name */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Event Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter event name"
                required
              />
            </div>

            {/* Date / Time / Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  id="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  min="15"
                  step="15"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Event Type / Event Frequency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="relative event-type-dropdown-container">
                <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type *
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
                    required
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

              <div className="relative frequency-dropdown-container">
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Frequency *
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
                    required
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

            {/* Church / Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="relative church-dropdown-container">
                <label htmlFor="church" className="block text-sm font-medium text-gray-700 mb-2">
                  Church *
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
                    required
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
                  Location *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="location"
                    value={locationSearch}
                    onChange={(e) => handleLocationSearchChange(e.target.value)}
                    onFocus={() => setShowLocationDropdown(true)}
                    disabled={!selectedChurch || isLoadingLocations}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder={
                      !selectedChurch 
                        ? "Select a church first" 
                        : isLoadingLocations 
                        ? "Loading locations..." 
                        : "Search and select location"
                    }
                    required
                  />
                  {isLoadingLocations ? (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : (
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  )}
                  
                  {showLocationDropdown && selectedChurch && !isLoadingLocations && (
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
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label htmlFor="additionalText" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="additionalText"
                value={additionalText}
                onChange={(e) => setAdditionalText(e.target.value)}
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
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
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

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

function getDayName(day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day];
}

export function Events() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [eventFrequencies, setEventFrequencies] = useState<EventFrequency[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [isLoadingFrequencies, setIsLoadingFrequencies] = useState(false);
  const [isLoadingChurches, setIsLoadingChurches] = useState(false);
  const [isLoadingEventTypes, setIsLoadingEventTypes] = useState(false);
  
  // Mock data - replace with actual API call
  const mockEvents: Event[] = Array.from({ length: 50 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Event ${i + 1}`,
    eventType: ['Service', 'Prayer Meeting', 'Bible Study', 'Youth Group'][i % 4],
    day: i % 7,
    time: (Math.floor(Math.random() * 17) + 6) * 60 + Math.floor(Math.random() * 4) * 15, // Between 6:00 AM and 10:00 PM
    duration: [60, 90, 120][i % 3],
    church_id: `church-${i + 1}`,
    location_id: `loc-${i + 1}`,
    eventFrequencyId: `freq-${i + 1}`,
    additionalText: i % 3 === 0 ? 'Special notes for this event' : '',
    churchName: `Church ${Math.floor(i / 3) + 1}`,
    locationAddress: `${100 + i} Church Street, City ${i % 5 + 1}`
  }));

  const [events, setEvents] = useState<Event[]>(mockEvents);

  // Fetch event types when component mounts
  const fetchEventTypes = async () => {
    try {
      setIsLoadingEventTypes(true);
      const response = await axios.get(`${ADMIN_BASE_URL}/event-types/all`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Handle different possible response structures
      let eventTypesData: EventType[] = [];
      if (response.data.status === 'success' && response.data.data) {
        eventTypesData = response.data.data.event_types || response.data.data;
      } else if (Array.isArray(response.data)) {
        eventTypesData = response.data;
      } else {
        console.warn('Unexpected response structure:', response.data);
        eventTypesData = [];
      }
      
      // Sort event types by name
      eventTypesData.sort((a, b) => a.name.localeCompare(b.name));
      setEventTypes(eventTypesData);
    } catch (err) {
      console.error('Error fetching event types:', err);
      setEventTypes([]);
    } finally {
      setIsLoadingEventTypes(false);
    }
  };

  // Fetch event frequencies when component mounts
  const fetchEventFrequencies = async () => {
    try {
      setIsLoadingFrequencies(true);
      const response = await axios.get(`${ADMIN_BASE_URL}/event-frequencies/all`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Handle different possible response structures
      if (response.data.status === 'success' && response.data.data) {
        setEventFrequencies(response.data.data.frequencies || response.data.data);
      } else if (Array.isArray(response.data)) {
        setEventFrequencies(response.data);
      } else {
        console.warn('Unexpected response structure:', response.data);
        setEventFrequencies([]);
      }
    } catch (err) {
      console.error('Error fetching event frequencies:', err);
      setEventFrequencies([]);
    } finally {
      setIsLoadingFrequencies(false);
    }
  };

  // Fetch churches when component mounts
  const fetchChurches = async () => {
    try {
      setIsLoadingChurches(true);
      const response = await axios.get(`${ADMIN_BASE_URL}/churches/all`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Handle different possible response structures
      if (response.data.status === 'success' && response.data.data) {
        setChurches(response.data.data.churches || response.data.data);
      } else if (Array.isArray(response.data)) {
        setChurches(response.data);
      } else {
        console.warn('Unexpected response structure:', response.data);
        setChurches([]);
      }
    } catch (err) {
      console.error('Error fetching churches:', err);
      setChurches([]);
    } finally {
      setIsLoadingChurches(false);
    }
  };

  useEffect(() => {
    fetchEventTypes();
    fetchEventFrequencies();
    fetchChurches();
  }, []);

  const itemsPerPage = 10;
  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.churchName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

  const handleAddEvent = async (eventData: Omit<Event, 'id'>) => {
    try {
      setIsSubmitting(true);
      
      // Create FormData object for form-data request
      const formData = new FormData();
      formData.append('name', eventData.name);
      formData.append('type_id', eventData.eventType); // This should be the type ID
      formData.append('date', new Date().toISOString().split('T')[0]); // Use the selected date
      formData.append('time', `${Math.floor(eventData.time / 60).toString().padStart(2, '0')}:${(eventData.time % 60).toString().padStart(2, '0')}`);
      formData.append('duration', eventData.duration.toString());
      formData.append('location_id', eventData.location_id);
      formData.append('frequency_id', eventData.eventFrequencyId);
      formData.append('notes', eventData.additionalText);
      
      const response = await axios.post(`${ADMIN_BASE_URL}/events/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });
      
      // Check if the response indicates success
      if (response.data.status === 'success' || response.status === 200 || response.status === 201) {
        // For now, add to local state with a new ID
        const newEvent: Event = {
          ...eventData,
          id: `${Date.now()}`
        };
        setEvents([...events, newEvent]);
        setShowAddModal(false);
      } else {
        throw new Error(response.data.message || 'Failed to create event');
      }
    } catch (err: any) {
      console.error('Error adding event:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEvent = async (eventData: Partial<Event>) => {
    if (editingEvent) {
      try {
        setIsSubmitting(true);
        
        // Create FormData object for form-data request
        const formData = new FormData();
        formData.append('id', editingEvent.id);
        if (eventData.name) formData.append('name', eventData.name);
        if (eventData.eventType) formData.append('type_id', eventData.eventType);
        if (eventData.time !== undefined) {
          formData.append('time', `${Math.floor(eventData.time / 60).toString().padStart(2, '0')}:${(eventData.time % 60).toString().padStart(2, '0')}`);
        }
        if (eventData.duration !== undefined) formData.append('duration', eventData.duration.toString());
        if (eventData.additionalText !== undefined) formData.append('notes', eventData.additionalText);
        
        const response = await axios.post(`${ADMIN_BASE_URL}/events/edit`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          }
        });
        
        // Check if the response indicates success
        if (response.data.status === 'success' || response.status === 200 || response.status === 201) {
          // For now, update local state
          setEvents(events.map(event => 
            event.id === editingEvent.id 
              ? { ...event, ...eventData }
              : event
          ));
          setEditingEvent(null);
        } else {
          throw new Error(response.data.message || 'Failed to update event');
        }
      } catch (err: any) {
        console.error('Error updating event:', err);
        throw new Error(err.response?.data?.message || err.message || 'Failed to update event');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedEvent) {
      try {
        setIsDeleting(true);
        
        // Create FormData object for form-data request
        const formData = new FormData();
        formData.append('id', selectedEvent.id);
        
        const response = await axios.post(`${ADMIN_BASE_URL}/events/delete`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          }
        });
        
        // Check if the response indicates success
        if (response.data.status === 'success' || response.status === 200 || response.status === 201) {
          // For now, remove from local state
          setEvents(events.filter(event => event.id !== selectedEvent.id));
          setSelectedEvent(null);
        } else {
          throw new Error(response.data.message || 'Failed to delete event');
        }
      } catch (err: any) {
        console.error('Error deleting event:', err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedEvents.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{event.name}</div>
                  <div className="text-sm text-gray-500">{event.churchName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {event.eventType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{getDayName(event.day)}</div>
                  <div className="text-sm text-gray-500">
                    {formatTime(event.time)} ({event.duration} mins)
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{event.locationAddress}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{event.additionalText || '-'}</div>
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

        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, filteredEvents.length)}
                </span>{' '}
                of <span className="font-medium">{filteredEvents.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
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
        />
      )}
    </div>
  );
}