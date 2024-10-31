// StatusModal.jsx
import React from 'react';

const StatusModal = ({ statusMessages, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-opacity-50 backdrop-filter backdrop-blur-lg flex items-center justify-center">
      <div className="bg-gray-300 rounded-lg p-4 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 px-4">Name</th>
              <th className="text-left py-2 px-4">Account Number</th>
              <th className="text-left py-2 px-4">Status</th>
              <th className="text-left py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {statusMessages.map((message, index) => (
              <tr key={index} >
                <td className="py-2 px-4">{message.name}</td>
                <td className="py-2 px-4">{message.accountNumber}</td>
                <td className="py-2 px-4">{message.status}</td>
                <td className="py-2 px-4">{message.statusicon}</td>

              </tr>
            ))}
          </tbody>
        </table>
   
        <button className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded-md" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default StatusModal;
