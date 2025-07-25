import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Book {
  _id: string;
  title: string;
  author: string;
  readingType: string;
}

const AdminBookApprovals: React.FC = () => {
  const [pendingBooks, setPendingBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ displayType: '', distributionType: '' });
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/books/admin/pending', { withCredentials: true })
      .then(res => {
        if (Array.isArray(res.data)) setPendingBooks(res.data);
        else if (Array.isArray((res.data as { books?: unknown }).books)) setPendingBooks((res.data as { books: Book[] }).books);
        else setPendingBooks([]);
      })
      .catch(() => setPendingBooks([]));
  }, []);

  const filteredBooks = Array.isArray(pendingBooks)
    ? pendingBooks.filter(book =>
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const openApproveModal = (book: Book) => {
    setSelectedBook(book);
    setForm({ displayType: '', distributionType: '' });
    setModalOpen(true);
    setError('');
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.displayType || !form.distributionType) {
      setError('Please select both display and distribution type.');
      return;
    }
    try {
      await axios.post(
        `/api/books/admin/approve/${selectedBook?._id}`,
        form,
        { withCredentials: true }
      );
      setPendingBooks(pendingBooks.filter(b => b._id !== selectedBook?._id));
      setModalOpen(false);
      setError('');
    } catch (err) {
      setError('Approval failed.');
    }
  };

  const handleReject = async (bookId: string) => {
    await axios.post(`/api/books/admin/reject/${bookId}`, {}, { withCredentials: true });
    setPendingBooks(pendingBooks.filter(b => b._id !== bookId));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Book Approvals</h2>
      <input
        type="text"
        placeholder="Search pending books..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full max-w-md"
      />
      {filteredBooks.length === 0 ? (
        <p>No pending books for approval.</p>
      ) : (
        filteredBooks.map(book => (
          <div key={book._id} className="border rounded p-4 mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-lg">{book.title}</h3>
              <p>Author: {book.author}</p>
              <p>Reading Type: {book.readingType === 'soft' ? 'Soft Copy' : 'Hard Copy'}</p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => openApproveModal(book)}>Approve</button>
              <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={() => handleReject(book._id)}>Reject</button>
            </div>
          </div>
        ))
      )}
      {modalOpen && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-lg">
            <h4 className="text-xl font-bold mb-4">Approve Book: {selectedBook.title}</h4>
            <form onSubmit={handleApprove} className="space-y-4">
              <div>
                <label className="font-semibold block mb-2">Where to feature?</label>
                <label className="mr-4">
                  <input type="radio" name="displayType" value="hero" checked={form.displayType === 'hero'} onChange={e => setForm({ ...form, displayType: e.target.value })} required /> Hero Section
                </label>
                <label>
                  <input type="radio" name="displayType" value="view-all" checked={form.displayType === 'view-all'} onChange={e => setForm({ ...form, displayType: e.target.value })} required /> View All Section
                </label>
              </div>
              <div>
                <label className="font-semibold block mb-2">Enable hard copy order?</label>
                <label className="mr-4">
                  <input type="radio" name="distributionType" value="hard" checked={form.distributionType === 'hard'} onChange={e => setForm({ ...form, distributionType: e.target.value })} required /> Yes
                </label>
                <label>
                  <input type="radio" name="distributionType" value="soft" checked={form.distributionType === 'soft'} onChange={e => setForm({ ...form, distributionType: e.target.value })} required /> No (Soft Copy Only)
                </label>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex gap-4 mt-4">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Approve</button>
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookApprovals;
