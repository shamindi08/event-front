'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4EBD3] via-[#DED3C4] to-[#98A1BC]">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-[#555879] mb-4">
          Welcome to Smart Event Management
        </h1>
        <p className="text-lg text-[#6B7196] mb-2">
          Your hub for discovering and joining amazing tech events.
        </p>
        <p className="text-sm text-[#98A1BC] mb-6">
          Start exploring now!
        </p>
        
        {/* Register Button */}
        <Link 
          href="/Register"
          className="bg-gradient-to-r from-[#555879] to-[#98A1BC] text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-block"
        >
          Register Now
        </Link>
      </div>
    </div>
  );
}