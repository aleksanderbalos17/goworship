import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import { ADMIN_BASE_URL } from '../constants/api';

interface Bible {
  id: string;
  book_id: string;
  chapter: string;
  verse: string;
  copy: string;
  created_at: string;
  updated_at: string | null;
  book_name: string;
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
    verses: Bible[];
    pagination: PaginationData;
  };
}

interface DeleteModalProps {
  bible: Bible;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

interface EditModalProps {
  bible: Bible;
  onClose: () => void;
  onConfirm: (bookId: string, chapter: number, verse: number, copy: string) => Promise<void>;
  isSubmitting: boolean;
}

interface AddModalProps {
  onClose: () => void;
  onConfirm: (bookId: string, chapter: number, verse: number, copy: string) => Promise<void>;
  isSubmitting: boolean;
}

function DeleteModal({ bible, onClose, onConfirm, isDeleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Bible Verse</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this verse from {bible.book_name} {bible.chapter}:{bible.verse}? This action cannot be undone.
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

function EditModal({ bible, onClose, onConfirm, isSubmitting }: EditModalProps) {
  const [bookId, setBookId] = useState(bible.book_id);
  const [chapter, setChapter] = useState(parseInt(bible.chapter));
  const [verse, setVerse] = useState(parseInt(bible.verse));
  const [copy, setCopy] = useState(bible.copy);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copy.trim()) {
      setError('Verse text is required');
      return;
    }
    if (chapter < 1) {
      setError('Chapter must be at least 1');
      return;
    }
    if (verse < 1) {
      setError('Verse must be at least 1');
      return;
    }
    try {
      await onConfirm(bookId, chapter, verse, copy);
    } catch (err) {
      setError('Failed to update verse');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Bible Verse</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="chapter" className="block text-sm font-medium text-gray-700 mb-1">
                Chapter
              </label>
              <input
                type="number"
                id="chapter"
                value={chapter}
                onChange={(e) => setChapter(parseInt(e.target.value))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="verse" className="block text-sm font-medium text-gray-700 mb-1">
                Verse
              </label>
              <input
                type="number"
                id="verse"
                value={verse}
                onChange={(e) => setVerse(parseInt(e.target.value))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="copy" className="block text-sm font-medium text-gray-700 mb-1">
                Verse Text
              </label>
              <textarea
                id="copy"
                value={copy}
                onChange={(e) => setCopy(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter verse text"
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

function AddModal({ onClose, onConfirm, isSubmitting }: AddModalProps) {
  const [bookId, setBookId] = useState('1');
  const [chapter, setChapter] = useState(1);
  const [verse, setVerse] = useState(1);
  const [copy, setCopy] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copy.trim()) {
      setError('Verse text is required');
      return;
    }
    if (chapter < 1) {
      setError('Chapter must be at least 1');
      return;
    }
    if (verse < 1) {
      setError('Verse must be at least 1');
      return;
    }
    try {
      await onConfirm(bookId, chapter, verse, copy);
      onClose();
    } catch (err) {
      setError('Failed to create verse');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Bible Verse</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="chapter" className="block text-sm font-medium text-gray-700 mb-1">
                Chapter
              </label>
              <input
                type="number"
                id="chapter"
                value={chapter}
                onChange={(e) => setChapter(parseInt(e.target.value))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="verse" className="block text-sm font-medium text-gray-700 mb-1">
                Verse
              </label>
              <input
                type="number"
                id="verse"
                value={verse}
                onChange={(e) => setVerse(parseInt(e.target.value))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="copy" className="block text-sm font-medium text-gray-700 mb-1">
                Verse Text
              </label>
              <textarea
                id="copy"
                value={copy}
                onChange={(e) => setCopy(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter verse text"
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
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Bibles() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBible, setSelectedBible] = useState<Bible | null>(null);
  const [editingBible, setEditingBible] = useState<Bible | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bibles, setBibles] = useState<Bible[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBibles = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get<ApiResponse>(`${ADMIN_BASE_URL}/bible-verses`, {
        params: {
          page,
          per_page: 20,
          sort_by: 'id',
          sort_order: 'ASC'
        },
        headers: {
          'Accept': 'application/json'
        }
      });
      setBibles(response.data.data.verses);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError('Failed to fetch bible verses. Please try again later.');
      console.error('Error fetching bible verses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBible = async (bookId: string, chapter: number, verse: number, copy: string) => {
    try {
      setIsSubmitting(true);
      await axios.post(`${ADMIN_BASE_URL}/bible-verses`, {
        book_id: bookId,
        chapter,
        verse,
        copy
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      await fetchBibles(currentPage);
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding bible verse:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBible = async (bookId: string, chapter: number, verse: number, copy: string) => {
    if (editingBible) {
      try {
        setIsSubmitting(true);
        await axios.put(
          `${ADMIN_BASE_URL}/bible-verses/${editingBible.id}`,
          {
            book_id: bookId,
            chapter,
            verse,
            copy
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
        await fetchBibles(currentPage);
        setEditingBible(null);
      } catch (err) {
        console.error('Error updating bible verse:', err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedBible) {
      try {
        setIsDeleting(true);
        await axios.delete(`${ADMIN_BASE_URL}/bible-verses/${selectedBible.id}`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        await fetchBibles(currentPage);
        setSelectedBible(null);
      } catch (err) {
        console.error('Error deleting bible verse:', err);
        setError('Failed to delete bible verse. Please try again later.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  useEffect(() => {
    fetchBibles(currentPage);
  }, [currentPage]);

  const filteredBibles = bibles.filter(bible => 
    bible.copy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bible.book_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !bibles.length) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Bible Verses</h1>
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
          <h1 className="text-2xl font-semibold text-gray-800">Bible Verses</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Bible Verses</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search verses..."
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
            <span>Add Verse</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chapter</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verse</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Text</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBibles.map((bible) => (
              <tr key={bible.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{bible.book_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{bible.chapter}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{bible.verse}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{bible.copy}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingBible(bible)}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedBible(bible)}
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

      {selectedBible && (
        <DeleteModal
          bible={selectedBible}
          onClose={() => setSelectedBible(null)}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      )}

      {editingBible && (
        <EditModal
          bible={editingBible}
          onClose={() => setEditingBible(null)}
          onConfirm={handleEditBible}
          isSubmitting={isSubmitting}
        />
      )}

      {showAddModal && (
        <AddModal
          onClose={() => setShowAddModal(false)}
          onConfirm={handleAddBible}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}