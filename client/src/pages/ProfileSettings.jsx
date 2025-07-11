import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage'; // 👈 Make sure this file exists

const BASE_URL = import.meta.env.VITE_API_URL;

const ProfileSettings = () => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const [username, setUsername] = useState(storedUser?.username || '');
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [isCropped, setIsCropped] = useState(false); // 👈 new

useEffect(() => {
  if (!avatar || isCropped) return; // 👈 Only show cropper if not cropped
  const reader = new FileReader();
  reader.onloadend = () => {
    setPreview(reader.result);
    setShowCropper(true);
  };
  reader.readAsDataURL(avatar);
}, [avatar, isCropped]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('username', username);
    if (avatar) form.append('avatar', avatar);

    try {
      const res = await axios.patch(`${BASE_URL}/api/users/${storedUser._id}`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success('✅ Profile updated!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('❌ Failed to update profile');
    }
  };

  return (
    <motion.div
      initial={{ x: '100vw', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        padding: '2rem',
        background: 'var(--bg)',
        color: 'var(--text)',
        minHeight: '100vh',
        position: 'relative'
      }}
    >
      {/* 🔙 Back */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          background: 'transparent',
          border: 'none',
          color: 'var(--text)',
          fontSize: '1.4rem'
        }}
      >
        <FiArrowLeft />
      </button>

      <h2 style={{
        marginBottom: '2rem',
        textAlign: 'center',
        fontSize: '1.6rem',
        fontWeight: 600
      }}>
        Edit Profile
      </h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: '0.7rem',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              width: '100%',
              background: 'var(--card)',
              color: 'var(--text)'
            }}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Avatar</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files[0])}
            style={{ color: 'var(--text)' }}
          />
        </div>

        {preview && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img
  src={preview}
  alt="Avatar Preview"
  style={{
    width: 80,
    height: 80,
    borderRadius: '50%', // 👈 This makes it display as a circle
    objectFit: 'cover'
  }}
/>

            <p style={{ fontSize: '0.8rem', color: 'var(--subtext)' }}>Preview</p>
          </div>
        )}

        <button
          type="submit"
          style={{
            background: '#b4ff39',
            color: '#000',
            padding: '0.8rem 1.6rem',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 'bold',
            width: '100%',
            fontSize: '1rem',
            boxShadow: '0 4px 10px rgba(180,255,57,0.4)'
          }}
        >
          ✅ Save Changes
        </button>
      </form>

      {/* 🥒 Cropper Overlay */}
      {showCropper && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex',
          flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ width: 300, height: 300, position: 'relative' }}>
            <div className="circular-crop" style={{ width: 300, height: 300, position: 'relative' }}>
  <Cropper
    image={preview}
    crop={crop}
    zoom={zoom}
    aspect={1} // square ratio = good for circles
    onCropChange={setCrop}
    onZoomChange={setZoom}
    onCropComplete={(croppedArea, pixels) => setCroppedAreaPixels(pixels)}
  />
</div>

          </div>

          <div style={{ marginTop: '1rem' }}>
<button
  onClick={async (e) => {
    e.preventDefault();
    const blob = await getCroppedImg(preview, croppedAreaPixels);
    const croppedFile = new File([blob], 'avatar.png', { type: 'image/png' });
    setAvatar(croppedFile);
    setPreview(URL.createObjectURL(blob));
    setIsCropped(true); // ✅ Mark as cropped
    setShowCropper(false);
  }}
  style={{
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    background: '#b4ff39',
    color: '#000',
    border: 'none',
    fontWeight: 'bold'
  }}
>
  ✅ Save Crop
</button>

          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={2000} />
    </motion.div>
  );
};

export default ProfileSettings;