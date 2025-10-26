import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminGallery() {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [gallery, setGallery] = useState([]);

  const fetchGallery = async () => {
    const res = await axios.get("http://localhost:5000/api/gallery");
    setGallery(res.data);
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("image", image);

    await axios.post("http://localhost:5000/api/gallery", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setTitle("");
    setImage(null);
    fetchGallery(); // refresh after upload
  };

  return (
    <div className="container mt-4">
      <h3>Add Gallery Image</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="file"
          className="form-control mb-2"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button className="btn btn-primary" type="submit">
          Upload
        </button>
      </form>

      <hr />

      <h4>Gallery</h4>
      <div className="row">
        {gallery.map((img) => (
          <div key={img._id} className="col-md-3 mb-3 text-center">
            <img
              src={`http://localhost:5000/uploads/${img.image}`}
              alt={img.title}
              className="img-fluid rounded shadow"
            />
            <p>{img.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
