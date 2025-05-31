// components/DropZone.jsx
import React from 'react';

const DropZone = ({ label, accept, onFileDrop }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileDrop(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileDrop(file);
    }
  };

  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className="dropzone"
      onDrop={handleDrop}
      onDragOver={preventDefaults}
      onDragEnter={preventDefaults}
      onDragLeave={preventDefaults}
    >
      <label className="dropzone-label">
        {label}
        <input type="file" accept={accept} onChange={handleFileChange} hidden />
      </label>
    </div>
  );
};

export default DropZone;