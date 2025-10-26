import { useEffect, useState } from "react";
import axios from "axios";

export default function GalleryPage() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/gallery")
      .then((res) => setImages(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="container py-5">
      <h2 className="fw-bold text-center mb-4">Gallery</h2>
      <div className="row">
        {images.map((img) => (
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
