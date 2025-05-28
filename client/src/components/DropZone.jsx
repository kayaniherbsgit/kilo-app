import React, { useRef } from 'react';

const DropZone = ({ onFileSelect, label }) => {
  const fileInputRef = useRef();

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      onClick={() => fileInputRef.current.click()}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        border: '2px dashed #888',
        padding: '25px',
        borderRadius: '10px',
        textAlign: 'center',
        marginBottom: '10px',
        color: '#ccc',
        cursor: 'pointer',
        background: '#1a1a1a'
      }}
    >
      {label || 'Click or Drag a file here to upload'}
      <input
        type="file"
        ref={fileInputRef}
        hidden
        onChange={(e) => onFileSelect(e.target.files[0])}
      />
    </div>
  );
};

export default DropZone;