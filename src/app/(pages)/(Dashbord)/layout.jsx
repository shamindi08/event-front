'use client';

import { useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import { MdMenu } from 'react-icons/md';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile Sidebar Overlay */}
      <div className="md:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Desktop Layout Container */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Fixed Desktop Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="w-72">
            <Sidebar isOpen={true} onClose={() => {}} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Hamburger Button */}
          <div className="md:hidden fixed top-20 left-4 z-30">
            <button
              onClick={() => setSidebarOpen(true)}
              className="bg-white/90 backdrop-blur-md shadow-lg p-3 rounded-xl text-slate-700 hover:text-indigo-600 transition-all duration-200 hover:bg-white hover:shadow-xl active:scale-95 transform border border-white/20"
            >
              <MdMenu size={24} />
            </button>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6 lg:p-8 max-w-full">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 min-h-[calc(100vh-8rem)] p-6 md:p-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}


