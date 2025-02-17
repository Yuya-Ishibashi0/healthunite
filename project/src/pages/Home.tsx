import React from 'react';
import { Building2, Users, Calendar, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
          alt="Modern hospital building"
          className="w-full h-[400px] object-cover rounded-xl"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-blue-600/40 rounded-xl">
          <div className="h-full flex items-center max-w-3xl mx-auto px-4">
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-4">
                Welcome to Tokyo Medical Facility
              </h1>
              <p className="text-xl mb-6">
                Providing world-class healthcare with Japanese precision and care
              </p>
              <Link
                to="/appointments"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
              >
                Book an Appointment
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: Building2,
            title: 'Specialized Departments',
            description: 'Expert care across multiple medical specialties',
            link: '/departments',
          },
          {
            icon: Users,
            title: 'Expert Doctors',
            description: 'Experienced healthcare professionals',
            link: '/doctors',
          },
          {
            icon: Calendar,
            title: 'Easy Scheduling',
            description: 'Book appointments online 24/7',
            link: '/appointments',
          },
          {
            icon: Phone,
            title: 'Emergency Care',
            description: '24/7 emergency medical services',
            link: '/emergency',
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <feature.icon className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600 mb-4">{feature.description}</p>
            <Link
              to={feature.link}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Learn more →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;