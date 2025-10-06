'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MdArrowForward, MdEvent, MdPeople, MdLocationOn, MdStar, MdTrendingUp, MdSecurity, MdSpeed } from 'react-icons/md';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: MdEvent,
      title: "Smart Event Management",
      description: "Create, organize, and manage events with powerful tools and intuitive interface."
    },
    {
      icon: MdPeople,
      title: "Community Engagement",
      description: "Connect with like-minded individuals and build meaningful professional relationships."
    },
    {
      icon: MdSecurity,
      title: "Secure & Reliable",
      description: "Your data is protected with enterprise-grade security and 99.9% uptime."
    },
    {
      icon: MdSpeed,
      title: "Lightning Fast",
      description: "Experience blazing-fast performance with our optimized platform."
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "500+", label: "Events Created" },
    { number: "98%", label: "User Satisfaction" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="gradient-text">Smart Event</span>
              <br />
              <span className="text-slate-800">Management</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-600 mb-6 max-w-3xl mx-auto leading-relaxed">
              Your premier destination for discovering, organizing, and participating in 
              <span className="text-indigo-600 font-semibold"> exceptional events</span> that matter.
            </p>
            
            {/* Additional Description */}
            <p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto">
              Join thousands of professionals who trust our platform to create memorable experiences and meaningful connections.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/Register"
                className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-indigo-500/25 transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
              >
                <span>Get Started Free</span>
                <MdArrowForward className="group-hover:translate-x-1 transition-transform duration-200" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <Link 
                href="/About"
                className="group bg-white/90 backdrop-blur-sm text-slate-700 px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl border border-white/20 hover:bg-white hover:shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
              >
                <span>Learn More</span>
                <MdArrowForward className="group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-4 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-8 w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 animate-pulse delay-300"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-20 animate-pulse delay-700"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`text-center transform transition-all duration-700 delay-${index * 200} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover-glow">
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.number}</div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Why Choose <span className="gradient-text">EventPro</span>?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Experience the future of event management with our cutting-edge platform designed for modern professionals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className={`group bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover-glow animate-fade-in`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Events?
              </h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Join thousands of event organizers who have elevated their event management experience with our platform.
              </p>
              <Link 
                href="/Register"
                className="inline-flex items-center space-x-2 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group"
              >
                <span>Start Your Journey</span>
                <MdArrowForward className="group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-20 h-20 border-2 border-white rounded-full"></div>
              <div className="absolute top-20 right-8 w-16 h-16 border-2 border-white rounded-full"></div>
              <div className="absolute bottom-8 left-1/4 w-24 h-24 border-2 border-white rounded-full"></div>
              <div className="absolute bottom-4 right-1/4 w-12 h-12 border-2 border-white rounded-full"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}