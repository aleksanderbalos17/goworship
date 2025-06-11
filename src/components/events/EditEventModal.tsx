import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { ADMIN_BASE_URL } from '../../constants/api';
import { Event, EventType, EventFrequency, Church, ChurchLocation, EventFormData } from './types';

interface EditEventModalProps {
  event: Event;
  onClose: () => void;
  onConfirm: (eventData: EventFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function EditEventModal({ event, onClose, onConfirm, isSubmitting }: EditEventModalProps) {
  const [name, setName] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [eventTypeSearch, setEventTypeSearch] = useState('');
  const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [churchSearch, setChurchSearch] = useState('');
  const [showChurchDropdown, setShowChurchDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<ChurchLocation | null>(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState<EventFrequency | null>(null);
  const [frequencySearch, setFrequencySearch] = useState('');
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [frequencies, setFrequencies] = useState<EventFrequency[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [churchLocations, setChurchLocations] = useState<ChurchLocation[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedChurch) {
      fetchChurchLocations(selectedChurch.id);
    } else {
      setChurchLocations([]);
      setSelectedLocation(null);
      setLocationSearch('');
    }
  }, [selectedChurch]);

  useEffect(() => {
    if (event && eventTypes.length > 0 && frequencies.length > 0 && churches.length > 0) {
      initializeFormData();
    }
  }, [event, eventTypes, frequencies, churches]);

  const fetchInitialData = async () => {
    try {
      setIsLoadingData(true);
      const [eventTypesRes, frequenciesRes, churchesRes] = await Promise.all([
        axios.get(`${ADMIN_BASE_URL}/event-types/all`),
        axios.get(`${ADMIN_BASE_URL}/event-frequencies/all`),
        axios.get(`${ADMIN_BASE_URL}/churches/all`)
      ]);

      setEventTypes(eventTypesRes.data.data?.event_types || eventTypesRes.data.data || []);
      setFrequencies(frequenciesRes.data.data?.frequencies || frequenciesRes.data.data || []);
      setChurches(churchesRes.data.data?.churches || churchesRes.data.data || []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load form data. Please try again.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchChurchLocations = async (churchId: string) => {
    try {
      const response = await axios.get(`${ADMIN_BASE_URL}/churches/${churchId}/locations`);
      const locations = response.data.data?.locations || response.data.data || [];
      setChurchLocations(locations);
      
      // If editing and there's a location_id, find and set the location
      if (event.location_id) {
        const currentLocation = locations.find((loc: ChurchLocation) => loc.id === event.location_id);
        if (currentLocation) {
          setSelectedLocation(currentLocation);
          setLocationSearch(currentLocation.name);
        }
      }
    } catch (err) {
      console.error('Error fetching church locations:', err);
      setChurchLocations([]);
    }
  };

  const initializeFormData = () => {
    setName(event.name);
    setDate(event.date);
    setTime(event.time);
    setDuration(event.duration);
    setNotes(event.notes);

    // Find and set event type
    const eventType = eventTypes.find(type => type.id === event.type_id);
    if (eventType) {
      setSelectedEventType(eventType);
      setEventTypeSearch(eventType.name);
    }

    // Find and set frequency
    const frequency = frequencies.find(freq => freq.id === event.frequency_id);
    if (frequency) {
      setSelectedFrequency(frequency);
      setFrequencySearch(frequency.name);
    }

    // Find and set church
    const church = churches.find(ch => ch.id === event.church_id);
    if (church) {
      setSelectedChurch(church);
      setChurchSearch(church.name);
    }
  };

  const filteredEventTypes = eventTypes.filter(type => 
    type.name.toLowerCase().includes(eventTypeSearch.toLowerCase())
  );

  const filteredFrequencies = frequencies.filter(frequency => 
    frequency.name.toLowerCase().includes(frequencySearch.toLowerCase())
  );

  const filteredChurches = churches.filter(church => 
    church.name.toLowerCase().includes(churchSearch.toLowerCase())
  );

  const filteredLocations = churchLocations.filter(location => 
    location.name.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const handleEventTypeSelect = (eventType: EventType) => {
    setSelectedEventType(eventType);
    setEventTypeSearch(eventType.name);
    setShowEventTypeDropdown(false);
  };

  const handleChurchSelect = (church: Church) => {
    setSelectedChurch(church);
    setChurchSearch(church.name);
    setShowChurchDropdown(false);
    setSelectedLocation(null);
    setLocationSearch('');
  };

  const handleLocationSelect = (location: ChurchLocation) => {
    setSelectedLocation(location);
    setLocationSearch(location.name);
    setShowLocationDropdown(false);
  };

  const handleFrequencySelect = (frequency: EventFrequency) => {
    setSelectedFrequency(frequency);
    setFrequencySearch(frequency.name);
    setShowFrequencyDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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

    if (!date) {
      setError('Please select a date');
      return;
    }

    if (!time) {
      setError('Please select a time');
      return;
    }

    try {
      const eventData: EventFormData = {
        name: name.trim(),
        eventType: selectedEventType,
        date,
        time,
        duration,
        church: selectedChurch,
        location: selectedLocation,
        frequency: selectedFrequency,
        notes: notes.trim()
      };

      await onConfirm(eventData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update event. Please try again.');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setShowEventTypeDropdown(false);
        setShowChurchDropdown(false);
        setShowLocationDropdown(false);
        setShowFrequencyDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading event data...</span>
          </div>
        </div>
      </div>
    );
  }

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
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Time (24h format) *
                </label>
                <input
                  type="time"
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="15"
                  step="15"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="60"
                />
              </div>
            </div>

            {/* Event Type / Frequency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="relative dropdown-container">
                <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="eventType"
                    value={eventTypeSearch}
                    onChange={(e) => {
                      setEventTypeSearch(e.target.value);
                      setShowEventTypeDropdown(true);
                      if (!e.target.value) setSelectedEventType(null);
                    }}
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

              <div className="relative dropdown-container">
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Frequency *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="frequency"
                    value={frequencySearch}
                    onChange={(e) => {
                      setFrequencySearch(e.target.value);
                      setShowFrequencyDropdown(true);
                      if (!e.target.value) setSelectedFrequency(null);
                    }}
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
              <div className="relative dropdown-container">
                <label htmlFor="church" className="block text-sm font-medium text-gray-700 mb-2">
                  Church *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="church"
                    value={churchSearch}
                    onChange={(e) => {
                      setChurchSearch(e.target.value);
                      setShowChurchDropdown(true);
                      if (!e.target.value) setSelectedChurch(null);
                    }}
                    onFocus={() => setShowChurchDropdown(true)}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Search and select church"
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
                                <div className="text-sm text-gray-500 truncate">{church.address}</div>
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

              <div className="relative dropdown-container">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="location"
                    value={locationSearch}
                    onChange={(e) => {
                      setLocationSearch(e.target.value);
                      setShowLocationDropdown(true);
                      if (!e.target.value) setSelectedLocation(null);
                    }}
                    onFocus={() => setShowLocationDropdown(true)}
                    disabled={!selectedChurch}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={selectedChurch ? "Search and select location" : "Select a church first"}
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
                                <div className="text-sm text-gray-500 truncate">{location.address}</div>
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
                    Select a church to see available locations
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
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
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