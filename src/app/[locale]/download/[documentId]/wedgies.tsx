import React, { useState } from 'react';

const DownloadSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(50);
  
  const moveUp = () => setPosition((prev) => Math.max(prev - 10, 0));
  const moveDown = () => setPosition((prev) => Math.min(prev + 10, 100));

  return (
    <div
      className="fixed right-0 z-50 transition-all duration-300 ease-in-out"
      style={{ top: `${position}%`, transform: 'translateY(-50%)' }}
    >
      {/* Sidebar Controls */}
      <div className="flex flex-col items-center space-y-1">
        {/* Move Up Button */}
        <button
          onClick={moveUp}
          className="bg-gray-300 text-gray-700 p-1 rounded-t shadow hover:bg-gray-400 transform hover:scale-110 transition-all duration-200"
          aria-label="Move Up"
        >
          ⬆️
        </button>
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-500 text-white p-2 rounded-l-md shadow-lg hover:bg-blue-600 transform hover:scale-105 transition-all duration-200"
          aria-label="Toggle Sidebar"
        >
          {isOpen ? '❮' : 'ℹ️'}
        </button>
        {/* Move Down Button */}
        <button
          onClick={moveDown}
          className="bg-gray-300 text-gray-700 p-1 rounded-b shadow hover:bg-gray-400 transform hover:scale-110 transition-all duration-200"
          aria-label="Move Down"
        >
          ⬇️
        </button>
      </div>
      {/* Sidebar Content */}
      <div
        className={`absolute right-full top-0 w-64 max-w-xs sm:max-w-sm bg-white shadow-2xl rounded-l-lg p-4 sm:p-6 border-l-4 border-blue-500 transition-all duration-300 transform ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
        style={{ maxHeight: 'calc(100vh - 32px)', overflowY: 'auto' }}
      >
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
          Download Page Tips
        </h3>
        <ul className="space-y-3 text-xs sm:text-sm text-gray-700">
          <li className="transform transition-all duration-200 hover:translate-x-1">
            <strong>✅ Ready Links:</strong> Green links are available for download.
          </li>
          <li className="transform transition-all duration-200 hover:translate-x-1">
            <strong>⏳ Pending Links:</strong> Gray links are still being processed.
          </li>
          <li className="transform transition-all duration-200 hover:translate-x-1">
            <strong>Support Developers:</strong> Consider supporting game creators by purchasing their content.
          </li>
          <li className="transform transition-all duration-200 hover:translate-x-1">
            <strong>Refresh:</strong> If links aren&apos;t showing, try reloading the page.
          </li>
          <li className="transform transition-all duration-200 hover:translate-x-1">
            <strong>Open in New Tab:</strong> Right-click links to open in a new browser tab.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DownloadSidebar;
