import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    sapId: '',
    course: '',
    batchYear: '',
    latitude: '',
    longitude: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastType, setToastType] = useState('info');

  const getLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }));
          setToastType('success');
          setMessage('📍 Location fetched successfully!');
        },
        (err) => {
          console.error('Location error:', err);
          setToastType('danger');
          setMessage('❌ Failed to fetch location.');
        }
      );
    } else {
      setToastType('danger');
      setMessage('Geolocation not supported.');
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post('http://localhost:5000/submit', formData);
      setToastType('success');
      setMessage(res.data.message);
    } catch (err) {
      setToastType('danger');
      setMessage(err.response?.data?.message || '❌ Server error');
    } finally {
      setLoading(false);
    }
  };

  const isLocationAvailable = formData.latitude && formData.longitude;

  return (
    <div className="main-bg d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow" style={{ maxWidth: '500px', width: '100%', borderRadius: '20px' }}>
        <h3 className="text-center text-primary mb-4">
          <i className="bi bi-geo-alt-fill me-2"></i>Geo Attendance
        </h3>
        <form onSubmit={handleSubmit}>
          {['name', 'email', 'sapId', 'course', 'batchYear'].map((field, i) => (
            <div className="mb-3" key={i}>
              <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                type={field === 'batchYear' ? 'number' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="form-control"
                placeholder={`Enter your ${field}`}
                required
              />
            </div>
          ))}

          <div className="d-grid gap-2">
            <button type="button" className="btn btn-outline-warning" onClick={getLocation}>
              🌍 Get Location
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : '✅ Submit'}
            </button>
          </div>
        </form>

        {isLocationAvailable && (
          <>
            <div className="text-muted mt-3">
              <p>📌 Latitude: {formData.latitude}</p>
              <p>📌 Longitude: {formData.longitude}</p>
            </div>
            <MapContainer center={[formData.latitude, formData.longitude]} zoom={15} style={{ height: 250 }} className="mb-3">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[formData.latitude, formData.longitude]}>
                <Popup>{formData.name || 'You are here'} 📍</Popup>
              </Marker>
            </MapContainer>
          </>
        )}

        {message && (
          <div className={`alert alert-${toastType} mt-2`} role="alert">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;