'use client';

import { useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import { MdMenu } from 'react-icons/md';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F4EBD3]">
      {/* Sidebar for desktop (fixed on the left) */}
      <div className="hidden md:block fixed top-0 left-0 h-full w-64 z-40">
        <Sidebar isOpen={true} />
      </div>

      {/* Sidebar for mobile (overlay drawer) */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
          <div className="absolute top-0 left-0 w-64 h-full bg-white shadow-lg z-50">
            <Sidebar isOpen={true} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 md:ml-64 transition-all duration-300 w-full">
        {/* Mobile Topbar */}
        <div className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-30 border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#555879] hover:text-[#98A1BC] transition-colors p-2 rounded-md hover:bg-gray-100"
          >
            <MdMenu size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#555879]">Smart Event Management</h1>
          <div className="w-10"></div>
        </div>

        {/* Page Content */}
        <main className="relative min-h-screen">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
