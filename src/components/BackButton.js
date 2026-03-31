import React from 'react';
import { useNavigate } from 'react-router-dom';

function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="mb-4 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
    >
      ← Back
    </button>
  );
}

export default BackButton;