import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

export default function AddStudent() {
  const [formData, setFormData] = useState({
    rollNo: '',
    name: '',
    email: '',
    password: '',
    course: '',
    semester: '',
    contact: '',
    dob: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      await API.post('/students', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/students'); // go back to student list
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add student');
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4">Add New Student</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        {['rollNo', 'name', 'email', 'password', 'course', 'semester', 'contact', 'dob'].map((field) => (
          <div className="mb-3" key={field}>
            <label className="form-label text-capitalize">{field}</label>
            <input
              type={field === 'dob' ? 'date' : field === 'password' ? 'password' : 'text'}
              className="form-control"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required={['rollNo', 'name', 'email', 'password'].includes(field)}
            />
          </div>
        ))}
        <button type="submit" className="btn btn-primary">Add Student</button>
      </form>
    </div>
  );
}
