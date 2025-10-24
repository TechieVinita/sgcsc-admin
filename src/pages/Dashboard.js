import { useState, useEffect } from 'react';
import API from '../utils/api';

export default function Dashboard() {
  // === Courses state ===
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [image, setImage] = useState(null);
  const [courses, setCourses] = useState([]);

  // === Gallery state ===
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryImage, setGalleryImage] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);

  // === Fetch Courses and Gallery from backend ===
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await API.get('/courses');
        setCourses(res.data);
      } catch (err) {
        console.error('Error fetching courses', err);
      }
    };

    const fetchGallery = async () => {
      try {
        const res = await API.get('/gallery');
        setGalleryItems(res.data);
      } catch (err) {
        console.error('Error fetching gallery', err);
      }
    };

    fetchCourses();
    fetchGallery();
  }, []);

  // === Handle Add Course ===
  const handleAddCourse = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('duration', duration);
    formData.append('image', image);

    try {
      const res = await API.post('/courses', formData);
      alert('Course added successfully!');
      setCourses([res.data, ...courses]); // Add to list
      setTitle('');
      setDescription('');
      setDuration('');
      setImage(null);
    } catch (err) {
      alert('Error adding course');
    }
  };

  // === Handle Delete Course ===
  const handleDeleteCourse = async (id) => {
    try {
      await API.delete(`/courses/${id}`);
      setCourses(courses.filter(c => c._id !== id));
      alert('Course deleted');
    } catch (err) {
      alert('Error deleting course');
    }
  };

  // === Handle Add Gallery Image ===
  const handleAddGallery = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', galleryTitle);
    formData.append('image', galleryImage);

    try {
      const res = await API.post('/gallery', formData);
      alert('Gallery image added!');
      setGalleryItems([res.data, ...galleryItems]);
      setGalleryTitle('');
      setGalleryImage(null);
    } catch (err) {
      alert('Error adding gallery image');
    }
  };

  // === Handle Delete Gallery Image ===
  const handleDeleteGallery = async (id) => {
    try {
      await API.delete(`/gallery/${id}`);
      setGalleryItems(galleryItems.filter(item => item._id !== id));
      alert('Gallery image deleted!');
    } catch (err) {
      alert('Error deleting gallery image');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Admin Dashboard</h1>

      {/* === Add Course Form === */}
      <form onSubmit={handleAddCourse} style={{ marginBottom: '30px' }}>
        <h2>Add Course</h2>
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
        <input type="text" placeholder="Duration" value={duration} onChange={e => setDuration(e.target.value)} required />
        <input type="file" onChange={e => setImage(e.target.files[0])} required />
        <button type="submit">Add Course</button>
      </form>

      {/* === Display Courses === */}
      <section style={{ marginBottom: '50px' }}>
        <h2>Courses</h2>
        {courses.length === 0 && <p>No courses available.</p>}
        {courses.map(course => (
          <div key={course._id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <p>{course.duration}</p>
            <button onClick={() => handleDeleteCourse(course._id)}>Delete</button>
          </div>
        ))}
      </section>

      {/* === Add Gallery Image Form === */}
      <form onSubmit={handleAddGallery} style={{ marginBottom: '30px' }}>
        <h2>Add Gallery Image</h2>
        <input type="text" placeholder="Title" value={galleryTitle} onChange={e => setGalleryTitle(e.target.value)} required />
        <input type="file" onChange={e => setGalleryImage(e.target.files[0])} required />
        <button type="submit">Add Image</button>
      </form>

      {/* === Display Gallery === */}
      <section>
        <h2>Gallery</h2>
        {galleryItems.length === 0 && <p>No gallery images yet.</p>}
        {galleryItems.map(item => (
          <div key={item._id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <h3>{item.title}</h3>
            <img src={`http://localhost:5000/uploads/${item.image}`} alt={item.title} width="200" />
            <button onClick={() => handleDeleteGallery(item._id)}>Delete</button>
          </div>
        ))}
      </section>
    </div>
  );
}
