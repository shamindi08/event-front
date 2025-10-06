'use client';
import { useState, useEffect } from 'react';
import { MdEvent, MdPeople, MdSecurity, MdSpeed, MdTrendingUp, MdSupport, MdArrowForward } from 'react-icons/md';
import Link from 'next/link';

export default function About() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: MdEvent,
      title: "Smart Event Management",
      description: "Create, organize, and manage events with powerful tools designed for professional success."
    },
    {
      icon: MdPeople,
      title: "Community Building",
      description: "Connect with like-minded professionals and build meaningful relationships that last."
    },
    {
      icon: MdSecurity,
      title: "Enterprise Security",
      description: "Your data is protected with bank-level security and industry-leading privacy standards."
    },
    {
      icon: MdSpeed,
      title: "Lightning Performance",
      description: "Experience blazing-fast performance with our optimized, cloud-native platform."
    },
    {
      icon: MdTrendingUp,
      title: "Analytics & Insights",
      description: "Get detailed analytics and insights to optimize your events and engagement."
    },
    {
      icon: MdSupport,
      title: "24/7 Support",
      description: "Our dedicated support team is here to help you succeed, anytime you need assistance."
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Users", description: "Professionals trust our platform" },
    { number: "10K+", label: "Events Created", description: "Successful events organized" },
    { number: "99.9%", label: "Uptime", description: "Reliable platform availability" },
    { number: "150+", label: "Countries", description: "Global reach and impact" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="gradient-text">About EventPro</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-6 max-w-4xl mx-auto leading-relaxed">
              We're revolutionizing the way professionals discover, organize, and participate in events. 
              Our platform combines cutting-edge technology with intuitive design to create 
              <span className="text-indigo-600 font-semibold"> exceptional event experiences</span>.
            </p>
            <p className="text-lg text-slate-500 mb-12 max-w-3xl mx-auto">
              Founded with the vision of making event management accessible to everyone, 
              we've grown to become the trusted choice for professionals worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Our <span className="gradient-text">Mission</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              To empower professionals and organizations with the tools they need to create meaningful connections and unforgettable experiences.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-12 md:p-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-slate-800 mb-6">
                  Building the Future of Events
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  We believe that great events start with great planning. Our platform provides the tools, 
                  insights, and community support needed to turn your vision into reality.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                  From intimate professional meetups to large-scale conferences, EventPro scales with your needs, 
                  ensuring every event is a success story.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div 
                    key={index}
                    className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100"
                  >
                    <div className="text-3xl font-bold gradient-text mb-2">{stat.number}</div>
                    <div className="text-slate-700 font-semibold mb-1">{stat.label}</div>
                    <div className="text-sm text-slate-500">{stat.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              What Makes Us <span className="gradient-text">Different</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We've built more than just an event platform – we've created an ecosystem that supports every aspect of event success.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className={`group bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover-glow animate-fade-in`}
                  style={{ animationDelay: `${index * 150}ms` }}
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

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Our <span className="gradient-text">Values</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">I</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Innovation</h3>
              <p className="text-slate-600 leading-relaxed">
                We continuously push the boundaries of what's possible in event technology, always seeking better ways to serve our community.
              </p>
            </div>

            <div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">C</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Community</h3>
              <p className="text-slate-600 leading-relaxed">
                We believe in the power of bringing people together and fostering meaningful connections that drive professional growth.
              </p>
            </div>

            <div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">E</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Excellence</h3>
              <p className="text-slate-600 leading-relaxed">
                We're committed to delivering exceptional experiences that exceed expectations and create lasting value for our users.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Join Our Community?
              </h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Discover why thousands of professionals choose EventPro for their event management needs. 
                Start your journey with us today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/Register"
                  className="inline-flex items-center space-x-2 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group"
                >
                  <span>Get Started Free</span>
                  <MdArrowForward className="group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                <Link 
                  href="/Login"
                  className="inline-flex items-center space-x-2 bg-transparent text-white border-2 border-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-indigo-600 transform hover:scale-105 transition-all duration-300"
                >
                  <span>Sign In</span>
                </Link>
              </div>
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
