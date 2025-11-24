// src/pages/Franchise.jsx
import React, { useEffect, useMemo, useState } from 'react';
import API from '../api/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { FaSearch, FaTrash, FaCheck, FaEye } from 'react-icons/fa';

// DEV sample image you've uploaded (will be replaced by actual uploaded URLs in production)
const DEV_SAMPLE_IMAGE = '/mnt/data/58e83842-f724-41ef-b678-0d3ad1e30ed8.png';

// ----- Dummy Franchise Examples (development/demo) -----
const dummyFranchises = [
  {
    _id: 'dummy1',
    ownerName: 'Ravi Kumar',
    instituteName: 'Future Vision Computer Center',
    dob: '1990-06-12',
    address: 'Main Market, Patna, Bihar - 800001',
    state: 'Bihar',
    district: 'Patna',
    teachersCount: 5,
    classRooms: 3,
    computers: 12,
    whatsapp: '9876543210',
    contact: '9123456789',
    email: 'ravi@example.com',
    ownerQualification: 'BCA',
    staffRoom: true,
    waterSupply: true,
    toilet: true,
    approved: false,
    username: 'ravi_center',
    // images (dev fallback)
    aadharFront: DEV_SAMPLE_IMAGE,
    aadharBack: DEV_SAMPLE_IMAGE,
    institutePhoto: DEV_SAMPLE_IMAGE,
    ownerSign: DEV_SAMPLE_IMAGE,
    ownerImage: DEV_SAMPLE_IMAGE,
  },
  {
    _id: 'dummy2',
    ownerName: 'Simran Kaur',
    instituteName: 'Bright Tech Computer Academy',
    dob: '1994-09-21',
    address: 'Civil Lines, Ludhiana, Punjab',
    state: 'Punjab',
    district: 'Ludhiana',
    teachersCount: 3,
    classRooms: 2,
    computers: 8,
    whatsapp: '9988776655',
    contact: '8877665544',
    email: 'simran@brighttech.in',
    ownerQualification: 'M.Sc IT',
    staffRoom: false,
    waterSupply: true,
    toilet: true,
    approved: true,
    username: 'brighttech_admin',
    aadharFront: DEV_SAMPLE_IMAGE,
    aadharBack: DEV_SAMPLE_IMAGE,
    institutePhoto: DEV_SAMPLE_IMAGE,
    ownerSign: DEV_SAMPLE_IMAGE,
    ownerImage: DEV_SAMPLE_IMAGE,
  },
];

//
// Small helper to format date (dd-mm-yyyy)
function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-GB');
}

function PlaceholderCard() {
  return (
    <div className="card mb-3 shadow-sm">
      <div className="row g-0">
        <div className="col-md-4" style={{ minHeight: 140, background: '#f6f6f6' }} />
        <div className="col-md-8">
          <div className="card-body">
            <h5 className="card-title placeholder-glow">
              <span className="placeholder col-6" />
            </h5>
            <p className="card-text placeholder-glow">
              <span className="placeholder col-7" /> <span className="placeholder col-4" /> <span className="placeholder col-4" />
            </p>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary placeholder col-2" />
              <button className="btn btn-sm btn-outline-secondary placeholder col-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Franchise() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filterHasPhotos, setFilterHasPhotos] = useState(false);
  const [filterNeedsApproval, setFilterNeedsApproval] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 9;

  // Drawer state
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Load list from backend (if available) or fallback to dummies
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await API.unwrap(API.get('/franchises'));
      if (Array.isArray(data) && data.length > 0) {
        setList(data);
      } else {
        // backend present but empty -> use dummy examples for UI demo
        setList(dummyFranchises);
      }
    } catch (err) {
      // backend missing or error -> load dummy examples for development/demo
      console.warn('franchises fetch failed (dev):', err);
      setList(dummyFranchises);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // derived filtered list
  const filtered = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    let out = list.slice();

    if (q) {
      out = out.filter((f) => {
        const owner = (f?.ownerName ?? '').toLowerCase();
        const inst = (f?.instituteName ?? '').toLowerCase();
        const state = (f?.state ?? '').toLowerCase();
        const district = (f?.district ?? '').toLowerCase();
        return owner.includes(q) || inst.includes(q) || state.includes(q) || district.includes(q);
      });
    }

    if (filterHasPhotos) {
      out = out.filter((f) => (f?.aadharFront || f?.aadharBack || f?.institutePhoto || f?.ownerImage));
    }

    if (filterNeedsApproval) {
      // assume a boolean "approved" field; if not present, show all as needs approval
      out = out.filter((f) => f && (f.approved === false || f.approved === undefined));
    }

    return out;
  }, [list, query, filterHasPhotos, filterNeedsApproval]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);

  const visible = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Quick actions
  const openDetails = (f) => {
    setSelected(f);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setSelected(null);
    setDrawerOpen(false);
  };

  const handleApprove = async (id) => {
    if (!id) return;
    if (!window.confirm('Mark this franchise as approved?')) return;
    setActionLoading(true);
    try {
      // Expect server route PUT/PATCH /api/franchises/:id (adjust if different)
      await API.put(`/franchises/${id}`, { approved: true });
      // update local state (works for real and dummy entries - for dummy this will update local copy only)
      setList((prev) => prev.map((p) => (p._id === id ? { ...p, approved: true } : p)));
      if (selected && selected._id === id) setSelected((s) => ({ ...s, approved: true }));
      alert('Approved');
    } catch (err) {
      console.error('approve franchise', err);
      alert(err.userMessage || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm('Delete this franchise record? This action cannot be undone.')) return;
    setActionLoading(true);
    try {
      // If backend exists this will delete; if using dummy data this will simply remove from local state
      await API.delete(`/franchises/${id}`);
      setList((p) => p.filter((x) => x._id !== id));
      closeDrawer();
    } catch (err) {
      console.warn('delete franchise (backend may be missing):', err);
      // fallback: remove locally if backend fails (useful for dev/dummy)
      setList((p) => p.filter((x) => x._id !== id));
      closeDrawer();
      // alert(err.userMessage || 'Failed to delete');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar />
        <div className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="mb-0">Franchise Submissions</h2>
              <div className="small text-muted">Public site submissions — review and manage here.</div>
            </div>

            <div className="d-flex gap-2 align-items-center">
              <div className="input-group">
                <span className="input-group-text bg-white"><FaSearch /></span>
                <input
                  className="form-control"
                  placeholder="Search owner, institute, state or district..."
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                />
              </div>

              <button
                className={`btn btn-outline-secondary ${filterHasPhotos ? 'active' : ''}`}
                onClick={() => setFilterHasPhotos((v) => !v)}
              >
                Has Photos
              </button>
              <button
                className={`btn btn-outline-secondary ${filterNeedsApproval ? 'active' : ''}`}
                onClick={() => setFilterNeedsApproval((v) => !v)}
              >
                Needs Approval
              </button>

              <button className="btn btn-outline-secondary" onClick={load} disabled={loading}>Refresh</button>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {/* Cards grid */}
          <div className="row">
            {loading && (
              // placeholders while loading
              Array.from({ length: 6 }).map((_, i) => (
                <div className="col-12 col-md-6 col-lg-4" key={`ph-${i}`}>
                  <PlaceholderCard />
                </div>
              ))
            )}

            {!loading && visible.length === 0 && filtered.length === 0 && (
              <div className="col-12">
                <div className="alert alert-info">No franchise submissions yet.</div>
              </div>
            )}

            {!loading && visible.map((f) => {
              const owner = f?.ownerName || '—';
              const inst = f?.instituteName || '—';
              const city = [f?.district, f?.state].filter(Boolean).join(', ');
              const thumbnail = f?.institutePhoto || f?.aadharFront || f?.ownerImage || DEV_SAMPLE_IMAGE;
              const approved = !!f?.approved;

              return (
                <div className="col-12 col-md-6 col-lg-4" key={f._id}>
                  <div className="card mb-3 shadow-sm h-100">
                    <img src={thumbnail} alt={inst} style={{ height: 160, objectFit: 'cover', width: '100%' }} />
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="card-title mb-1">{owner}</h5>
                          <div className="small text-muted">{inst}</div>
                          <div className="small text-muted">{city}</div>
                        </div>
                        <div className="text-end">
                          <div className={`badge ${approved ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {approved ? 'Approved' : 'Pending'}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="small text-muted">Contact</div>
                        <div className="fw-semibold">{f?.whatsapp || f?.contact || '—'}</div>
                      </div>

                      <div className="mt-3 mt-auto d-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary flex-grow-1" onClick={() => openDetails(f)}><FaEye /> View</button>
                        <button className="btn btn-sm btn-success" title="Approve" onClick={() => handleApprove(f._id)} disabled={approved}><FaCheck /></button>
                        <button className="btn btn-sm btn-danger" title="Delete" onClick={() => handleDelete(f._id)}><FaTrash /></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="small text-muted">
              Showing {filtered.length === 0 ? 0 : ((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
            </div>

            <nav>
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(1)}>First</button>
                </li>
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
                </li>
                <li className="page-item disabled"><span className="page-link">{currentPage} / {totalPages}</span></li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(totalPages)}>Last</button>
                </li>
              </ul>
            </nav>
          </div>

          {/* RIGHT-SIDE DRAWER: details */}
          <div
            className={`position-fixed top-0 end-0 h-100 bg-white shadow-lg transition`}
            style={{
              width: drawerOpen ? Math.min(760, window.innerWidth * 0.9) : 0,
              transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 220ms ease-in-out, width 220ms ease-in-out',
              overflow: 'auto',
              zIndex: 1050
            }}
            aria-hidden={!drawerOpen}
          >
            {selected ? (
              <div style={{ minWidth: 320, maxWidth: 760 }}>
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">{selected.ownerName || '—'}</h5>
                    <div className="small text-muted">{selected.instituteName || '—'}</div>
                  </div>

                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary" onClick={() => { setSelected(null); setDrawerOpen(false); }}>Close</button>
                  </div>
                </div>

                <div className="p-3">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-2">
                        <strong>Owner Name</strong>
                        <div>{selected.ownerName || '—'}</div>
                      </div>

                      <div className="mb-2">
                        <strong>Institute</strong>
                        <div>{selected.instituteName || '—'}</div>
                      </div>

                      <div className="mb-2">
                        <strong>Date of Birth</strong>
                        <div>{selected.dob ? formatDate(selected.dob) : '—'}</div>
                      </div>

                      <div className="mb-2">
                        <strong>Address</strong>
                        <div>{selected.address || '—'}</div>
                      </div>

                      <div className="mb-2">
                        <strong>State / District</strong>
                        <div>{(selected.state || '-') + (selected.district ? ` / ${selected.district}` : '')}</div>
                      </div>

                      <div className="mb-2">
                        <strong>Teachers / Class Rooms / PCs</strong>
                        <div>{selected.teachersCount ?? '-'} / {selected.classRooms ?? '-'} / {selected.computers ?? '-'}</div>
                      </div>

                      <div className="mb-2">
                        <strong>Contact</strong>
                        <div>{selected.whatsapp || selected.contact || '—'}</div>
                      </div>

                      <div className="mb-2">
                        <strong>Email</strong>
                        <div>{selected.email || '—'}</div>
                      </div>

                      <div className="mb-2">
                        <strong>Qualification</strong>
                        <div>{selected.ownerQualification || '—'}</div>
                      </div>

                      <div className="mb-2">
                        <strong>Facilities</strong>
                        <div>Staff Room: {selected.staffRoom ? 'Yes' : 'No'} • Water: {selected.waterSupply ? 'Yes' : 'No'} • Toilet: {selected.toilet ? 'Yes' : 'No'}</div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <strong>Images</strong>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                          <div className="text-center">
                            <div className="small text-muted">Aadhar Front</div>
                            <img src={selected.aadharFront || DEV_SAMPLE_IMAGE} alt="aadhar-front" style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 6 }} />
                          </div>

                          <div className="text-center">
                            <div className="small text-muted">Aadhar Back</div>
                            <img src={selected.aadharBack || DEV_SAMPLE_IMAGE} alt="aadhar-back" style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 6 }} />
                          </div>

                          <div className="text-center">
                            <div className="small text-muted">Institute Photo</div>
                            <img src={selected.institutePhoto || DEV_SAMPLE_IMAGE} alt="inst" style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 6 }} />
                          </div>

                          <div className="text-center">
                            <div className="small text-muted">Owner Sign</div>
                            <img src={selected.ownerSign || DEV_SAMPLE_IMAGE} alt="sign" style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 6 }} />
                          </div>

                          <div className="text-center">
                            <div className="small text-muted">Owner Photo</div>
                            <img src={selected.ownerImage || DEV_SAMPLE_IMAGE} alt="owner" style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 6 }} />
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <strong>Notes / Username</strong>
                        <div className="small text-muted">Username: {selected.username || '—'}</div>
                        <div className="mt-2 small text-muted">Password is not shown for security reasons.</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 d-flex gap-2 justify-content-end">
                    <button className="btn btn-outline-secondary" onClick={() => closeDrawer()}>Close</button>
                    <button className="btn btn-danger" disabled={actionLoading} onClick={() => handleDelete(selected._id)}><FaTrash /> Delete</button>
                    <button className="btn btn-success" disabled={actionLoading || selected.approved} onClick={() => handleApprove(selected._id)}><FaCheck /> {selected.approved ? 'Approved' : 'Approve'}</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4">No item selected</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
