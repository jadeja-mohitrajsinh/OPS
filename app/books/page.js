'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';

const STATUSES = ['ALL', 'READING', 'WANT_TO_READ', 'COMPLETED', 'ABANDONED'];
const STATUS_LABELS = {
  READING: '📖 Currently Reading',
  WANT_TO_READ: '⏳ Want to Read',
  COMPLETED: '✅ Completed',
  ABANDONED: '🛑 Abandoned',
};

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const [form, setForm] = useState({
    title: '',
    author: '',
    status: 'READING',
    currentPage: 0,
    totalPages: 0,
    rating: 5,
    area: 'Startup & Strategy',
    thingApplied: '',
    notes: '',
    quotes: '',
  });

  async function loadBooks() {
    try {
      const res = await fetch('/api/books');
      const data = await res.json();
      if (data.success) {
        setBooks(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    try {
      const payload = {
        ...form,
        currentPage: Number(form.currentPage) || 0,
        totalPages: Number(form.totalPages) || 0,
        rating: Number(form.rating) || 5,
        notes: form.notes ? form.notes.split('\n').filter(Boolean) : [],
        quotes: form.quotes ? form.quotes.split('\n').filter(Boolean) : [],
      };

      if (editingBook) {
        await fetch(`/api/books/${editingBook._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setShowModal(false);
      setEditingBook(null);
      setForm({
        title: '',
        author: '',
        status: 'READING',
        currentPage: 0,
        totalPages: 0,
        rating: 5,
        area: 'Startup & Strategy',
        thingApplied: '',
        notes: '',
        quotes: '',
      });
      loadBooks();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleQuickPageUpdate(id, newPage, totalPages) {
    try {
      const page = Math.max(0, Number(newPage) || 0);
      const isFinished = totalPages > 0 && page >= totalPages;
      await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPage: page,
          ...(isFinished ? { status: 'COMPLETED' } : {})
        }),
      });
      loadBooks();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this book?')) return;
    try {
      await fetch(`/api/books/${id}`, { method: 'DELETE' });
      loadBooks();
    } catch (err) {
      console.error(err);
    }
  }

  function openEdit(book) {
    setEditingBook(book);
    setForm({
      title: book.title || '',
      author: book.author || '',
      status: book.status || 'READING',
      currentPage: book.currentPage || 0,
      totalPages: book.totalPages || 0,
      rating: book.rating || 5,
      area: book.area || 'Startup & Strategy',
      thingApplied: book.thingApplied || '',
      notes: (book.notes || []).join('\n'),
      quotes: (book.quotes || []).join('\n'),
    });
    setShowModal(true);
  }

  const filtered = books.filter(b => {
    if (selectedStatus !== 'ALL' && b.status !== selectedStatus) return false;
    return true;
  });

  const readingNow = books.filter(b => b.status === 'READING');
  const completed = books.filter(b => b.status === 'COMPLETED');

  return (
    <AppShell>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>📚</span>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Books & Reading OS</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Active reading, key mental models, quotes & real-world applications
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingBook(null);
            setForm({
              title: '',
              author: '',
              status: 'READING',
              currentPage: 0,
              totalPages: 0,
              rating: 5,
              area: 'Startup & Strategy',
              thingApplied: '',
              notes: '',
              quotes: '',
            });
            setShowModal(true);
          }}
        >
          + Add Book
        </button>
      </div>

      {/* KPI Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 20 }}>
        <div className="card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--blue)', textTransform: 'uppercase', fontWeight: 700 }}>Reading Now</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--blue)', marginTop: 4 }}>{readingNow.length}</div>
        </div>
        <div className="card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--green)', textTransform: 'uppercase', fontWeight: 700 }}>Completed</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)', marginTop: 4 }}>{completed.length}</div>
        </div>
        <div className="card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Books</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{books.length}</div>
        </div>
      </div>

      {/* Status Filter */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 16 }}>
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setSelectedStatus(s)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: selectedStatus === s ? 'var(--text)' : 'var(--surface-2)',
              color: selectedStatus === s ? 'var(--bg)' : 'var(--text-secondary)',
            }}
          >
            {s === 'ALL' ? `All (${books.length})` : `${STATUS_LABELS[s] || s} (${books.filter(b => b.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No books found</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Add what you are currently reading or want to read next.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(book => {
            const pct = book.totalPages > 0 ? Math.min(100, Math.round((book.currentPage / book.totalPages) * 100)) : 0;

            return (
              <div
                key={book._id}
                className="card"
                style={{
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {/* Book Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'var(--surface-2)', color: 'var(--purple)' }}>
                        {book.area || 'Book'}
                      </span>
                      {book.status === 'COMPLETED' && (
                        <span style={{ fontSize: 11, color: 'var(--yellow)' }}>
                          {'★'.repeat(book.rating || 5)}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 800 }}>{book.title}</h3>
                    {book.author && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>by {book.author}</p>}
                  </div>

                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 12, background: 'var(--surface-2)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {STATUS_LABELS[book.status] || book.status}
                  </span>
                </div>

                {/* Progress Bar (if reading or has pages) */}
                {book.totalPages > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                      <span>Progress: Page {book.currentPage} of {book.totalPages}</span>
                      <span>{pct}%</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green)', transition: 'width 0.3s ease' }} />
                    </div>

                    {book.status === 'READING' && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Quick Update:</span>
                        <input
                          type="number"
                          className="input"
                          style={{ width: 70, padding: '2px 6px', fontSize: 12 }}
                          defaultValue={book.currentPage}
                          onBlur={e => handleQuickPageUpdate(book._id, e.target.value, book.totalPages)}
                          onKeyDown={e => e.key === 'Enter' && handleQuickPageUpdate(book._id, e.target.value, book.totalPages)}
                        />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/ {book.totalPages}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Thing Applied (High priority field) */}
                {book.thingApplied ? (
                  <div style={{ fontSize: 12, background: 'var(--green-bg)', padding: '8px 10px', borderRadius: 6, borderLeft: '3px solid var(--green)' }}>
                    <strong style={{ color: 'var(--green)', display: 'block', marginBottom: 2 }}>🎯 WHAT I APPLIED:</strong>
                    <span style={{ color: 'var(--text)' }}>{book.thingApplied}</span>
                  </div>
                ) : (
                  book.status === 'COMPLETED' && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No real-world application logged yet.
                    </div>
                  )
                )}

                {/* Key Notes / Quotes preview */}
                {(book.notes?.length > 0 || book.quotes?.length > 0) && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--surface-2)', padding: 8, borderRadius: 6 }}>
                    {book.quotes?.length > 0 && (
                      <div style={{ fontStyle: 'italic', marginBottom: book.notes?.length > 0 ? 4 : 0 }}>
                        &ldquo;{book.quotes[0]}&rdquo;
                      </div>
                    )}
                    {book.notes?.length > 0 && (
                      <div style={{ color: 'var(--text)' }}>
                        • {book.notes[0]}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => openEdit(book)}>
                    Edit / Notes
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: 'var(--red)' }} onClick={() => handleDelete(book._id)}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>{editingBook ? 'Edit Book' : 'Add Book'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="label">Book Title *</label>
                <input
                  className="input"
                  required
                  placeholder="e.g. Zero to One"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Author</label>
                  <input
                    className="input"
                    placeholder="Peter Thiel"
                    value={form.author}
                    onChange={e => setForm({ ...form, author: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Status</label>
                  <select
                    className="input select"
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="READING">📖 Currently Reading</option>
                    <option value="WANT_TO_READ">⏳ Want to Read</option>
                    <option value="COMPLETED">✅ Completed</option>
                    <option value="ABANDONED">🛑 Abandoned</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Current Page</label>
                  <input
                    type="number"
                    className="input"
                    value={form.currentPage}
                    onChange={e => setForm({ ...form, currentPage: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Total Pages</label>
                  <input
                    type="number"
                    className="input"
                    value={form.totalPages}
                    onChange={e => setForm({ ...form, totalPages: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Rating (1-5)</label>
                  <select
                    className="input select"
                    value={form.rating}
                    onChange={e => setForm({ ...form, rating: e.target.value })}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4)</option>
                    <option value={3}>⭐⭐⭐ (3)</option>
                    <option value={2}>⭐⭐ (2)</option>
                    <option value={1}>⭐ (1)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">What I Applied (Action item from this book)</label>
                <input
                  className="input"
                  placeholder="e.g. Redesigned customer acquisition strategy around a single high-conversion channel"
                  value={form.thingApplied}
                  onChange={e => setForm({ ...form, thingApplied: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Key Takeaways (one per line)</label>
                <textarea
                  className="input textarea"
                  rows={3}
                  placeholder="Key mental model 1&#10;Key mental model 2"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Favorite Quotes (one per line)</label>
                <textarea
                  className="input textarea"
                  rows={2}
                  placeholder="Great quote from page 45..."
                  value={form.quotes}
                  onChange={e => setForm({ ...form, quotes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBook ? 'Save Changes' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
