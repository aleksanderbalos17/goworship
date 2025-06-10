import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2, Plus, Upload, ChevronDown, X } from 'lucide-react';
import axios from 'axios';
import { ADMIN_BASE_URL } from '../constants/api';
import { GoogleMap } from './GoogleMap';

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
  denomination_name?: string;
}

interface Denomination {
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
    churches: Church[];
    pagination: PaginationData;
  };
}

interface DeleteModalProps {
  church: Church;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

interface AddChurchModalProps {
  onClose: () => void;
  onConfirm: (churchData: ChurchFormData) => Promise<void>;
  isSubmitting: boolean;
  denominations: Denomination[];
}

interface ChurchFormData {
  name: string;
  photo_url: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  speakers: string | null;
  denomination_id: number;
}

function DeleteModal({ church, onClose, onConfirm, isDeleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Church</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{church.name}"? This action cannot be undone.
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

function AddChurchModal({ onClose, onConfirm, isSubmitting, denominations }: AddChurchModalProps) {
  const [name, setName] = useState('Sample Church Test');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>('https://admin.goworship.co.uk/church_images/1749530592_dd9274077389342cf3b2.jpg');
  const [address, setAddress] = useState('123 Church Street, City, Country');
  const [latitude, setLatitude] = useState<string>('51.5074');
  const [longitude, setLongitude] = useState<string>('-0.1278');
  const [speakers, setSpeakers] = useState('John Doe, Jane Smith');
  const [selectedDenomination, setSelectedDenomination] = useState<Denomination | null>(null);
  const [denominationSearch, setDenominationSearch] = useState('');
  const [showDenominationDropdown, setShowDenominationDropdown] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Set default denomination if available
  useEffect(() => {
    if (denominations.length > 0 && !selectedDenomination) {
      const firstDenomination = denominations[0];
      setSelectedDenomination(firstDenomination);
      setDenominationSearch(firstDenomination.name);
    }
  }, [denominations, selectedDenomination]);

  // Filter denominations based on search term
  const filteredDenominations = denominations.filter(denomination => 
    denomination.name.toLowerCase().includes(denominationSearch.toLowerCase())
  );

  const handleDenominationSelect = (denomination: Denomination) => {
    setSelectedDenomination(denomination);
    setDenominationSearch(denomination.name);
    setShowDenominationDropdown(false);
  };

  const handleDenominationSearchChange = (value: string) => {
    setDenominationSearch(value);
    setShowDenominationDropdown(true);
    if (!value) {
      setSelectedDenomination(null);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image file size must be less than 5MB');
      return;
    }

    setPhotoFile(file);
    setUploadError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-upload the image
    await uploadPhoto(file);
  };

  const uploadPhoto = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsUploadingPhoto(true);
      setUploadError(null);
      
      const response = await axios.post(`${ADMIN_BASE_URL}/upload/church-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });
      
      if (response.data.status === 'success' && response.data.data?.url) {
        setUploadedPhotoUrl(response.data.data.url);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      setUploadError(
        err.response?.data?.message || 
        err.message || 
        'Failed to upload photo. Please try again.'
      );
      setUploadedPhotoUrl(null);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setUploadedPhotoUrl(null);
    setUploadError(null);
  };

  const handleLocationSelect = (lat: string, lng: string) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Church name is required');
      return;
    }

    if (!selectedDenomination) {
      setError('Please select a denomination');
      return;
    }

    try {
      const churchData: ChurchFormData = {
        name: name.trim(),
        photo_url: uploadedPhotoUrl,
        address: address.trim() || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        speakers: speakers.trim() || null,
        denomination_id: parseInt(selectedDenomination.id)
      };

      console.log('Submitting church data:', churchData);
      await onConfirm(churchData);
      onClose();
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to create church. Please try again.');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.denomination-dropdown-container')) {
        setShowDenominationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold text-gray-900">Add New Church</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Row 1: Church Name */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Church Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter church name"
                required
              />
            </div>

            {/* Row 2: Photo Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Church Photo
              </label>
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photo-upload"
                      disabled={isUploadingPhoto}
                    />
                    <label htmlFor="photo-upload" className={`cursor-pointer ${isUploadingPhoto ? 'pointer-events-none' : ''}`}>
                      {isUploadingPhoto ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                          <p className="text-sm text-gray-600">Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">
                            <span className="font-medium text-indigo-600 hover:text-indigo-500">
                              Click to upload
                            </span>{' '}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </>
                      )}
                    </label>
                  </div>
                  
                  {/* Upload Status */}
                  {uploadError && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                      {uploadError}
                    </div>
                  )}
                  
                  {uploadedPhotoUrl && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-700 font-medium mb-1">✓ Photo uploaded successfully</p>
                      <p className="text-xs text-gray-500 break-all">{uploadedPhotoUrl}</p>
                    </div>
                  )}
                </div>
                
                {(photoPreview || uploadedPhotoUrl) && (
                  <div className="relative">
                    <img
                      src={photoPreview || uploadedPhotoUrl || ''}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Row 3: Address */}
            <div className="mb-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Full Address
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter complete church address"
              />
            </div>

            {/* Row 4: Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  id="latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  step="any"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., 40.7128"
                />
              </div>
              
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  id="longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  step="any"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., -74.0060"
                />
              </div>
            </div>

            {/* Row 5: Google Maps */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Location on Map
              </label>
              <GoogleMap
                latitude={latitude}
                longitude={longitude}
                onLocationSelect={handleLocationSelect}
                height="400px"
              />
            </div>

            {/* Row 6: Speakers and Denomination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="speakers" className="block text-sm font-medium text-gray-700 mb-2">
                  Speakers
                </label>
                <input
                  type="text"
                  id="speakers"
                  value={speakers}
                  onChange={(e) => setSpeakers(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter speaker names separated by commas"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Separate multiple speakers with commas (e.g., John Smith, Jane Doe)
                </p>
              </div>

              <div className="relative denomination-dropdown-container">
                <label htmlFor="denomination" className="block text-sm font-medium text-gray-700 mb-2">
                  Denomination *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="denomination"
                    value={denominationSearch}
                    onChange={(e) => handleDenominationSearchChange(e.target.value)}
                    onFocus={() => setShowDenominationDropdown(true)}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Search and select denomination"
                    required
                  />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  
                  {showDenominationDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <div className="max-h-40 overflow-y-auto">
                        {filteredDenominations.length > 0 ? (
                          filteredDenominations.map((denomination) => (
                            <button
                              key={denomination.id}
                              type="button"
                              onClick={() => handleDenominationSelect(denomination)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{denomination.name}</div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500 text-center">
                            {denominationSearch ? 'No denominations found' : 'Start typing to search denominations'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
                disabled={isSubmitting || isUploadingPhoto}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingPhoto}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Church'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Churches() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [churches, setChurches] = useState<Church[]>([]);
  const [denominations, setDenominations] = useState<Denomination[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChurches = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get<ApiResponse>(`${ADMIN_BASE_URL}/churches`, {
        params: {
          page,
          per_page: 50,
          sort_by: 'id',
          sort_order: 'ASC'
        },
        headers: {
          'Accept': 'application/json'
        }
      });
      setChurches(response.data.data.churches);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError('Failed to fetch churches. Please try again later.');
      console.error('Error fetching churches:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDenominations = async () => {
    try {
      const response = await axios.get(`${ADMIN_BASE_URL}/denominations/all`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.data.status === 'success' && response.data.data) {
        setDenominations(response.data.data.denominations || response.data.data);
      } else if (Array.isArray(response.data)) {
        setDenominations(response.data);
      }
    } catch (err) {
      console.error('Error fetching denominations:', err);
      setDenominations([]);
    }
  };

  useEffect(() => {
    fetchChurches(currentPage);
    fetchDenominations();
  }, [currentPage]);

  const handleAddChurch = async (churchData: ChurchFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log('Making API request to:', `${ADMIN_BASE_URL}/churches/create`);
      console.log('Request data:', churchData);
      
      // Make API call to save the church using the correct endpoint
      const response = await axios.post(`${ADMIN_BASE_URL}/churches/create`, churchData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('API Response:', response);

      // Check if the response indicates success
      if (response.data.status === 'success' || response.status === 200 || response.status === 201) {
        // Refresh the churches list to show the new church
        await fetchChurches(currentPage);
        setShowAddModal(false);
      } else {
        throw new Error(response.data.message || 'Failed to create church');
      }
    } catch (err: any) {
      console.error('Error adding church:', err);
      console.error('Error response:', err.response);
      
      // Extract error message from response
      let errorMessage = 'Failed to create church. Please try again.';
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

  const handleDelete = (church: Church) => {
    setSelectedChurch(church);
  };

  const handleDeleteConfirm = async () => {
    if (selectedChurch) {
      try {
        setIsDeleting(true);
        await axios.delete(`${ADMIN_BASE_URL}/churches/${selectedChurch.id}`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        await fetchChurches(currentPage);
        setSelectedChurch(null);
      } catch (err) {
        console.error('Error deleting church:', err);
        setError('Failed to delete church. Please try again later.');
      } finally {
        setIsDeleting(false);
      }
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

  // Helper function to get denomination name by ID
  const getDenominationName = (denominationId: string) => {
    const denomination = denominations.find(d => d.id === denominationId);
    return denomination?.name || 'Unknown';
  };

  const filteredChurches = churches.filter(church => 
    church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (church.address && church.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (church.speakers && church.speakers.toLowerCase().includes(searchTerm.toLowerCase())) ||
    getDenominationName(church.denomination_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !churches.length) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Churches</h1>
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
          <h1 className="text-2xl font-semibold text-gray-800">Churches</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              fetchChurches(currentPage);
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
        <h1 className="text-2xl font-semibold text-gray-800">Churches</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search churches..."
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
            <span>Add Church</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Speakers</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Denomination</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredChurches.map((church) => (
              <tr key={church.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{church.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {church.photo_url ? (
                    <img
                      src={church.photo_url}
                      alt={church.name}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No photo</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {church.address || '-'}
                  </div>
                  {church.latitude && church.longitude && (
                    <div className="text-xs text-gray-400 mt-1">
                      {parseFloat(church.latitude).toFixed(4)}, {parseFloat(church.longitude).toFixed(4)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs">
                    {church.speakers || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {getDenominationName(church.denomination_id)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {}}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(church)}
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

      {selectedChurch && (
        <DeleteModal
          church={selectedChurch}
          onClose={() => setSelectedChurch(null)}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      )}

      {showAddModal && (
        <AddChurchModal
          onClose={() => setShowAddModal(false)}
          onConfirm={handleAddChurch}
          isSubmitting={isSubmitting}
          denominations={denominations}
        />
      )}
    </div>
  );
}