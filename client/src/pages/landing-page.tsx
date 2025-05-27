import React from 'react';
import { useLocation } from 'wouter';
import { 
  Heart, 
  Shield, 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp,
  Stethoscope,
  Clock,
  Award,
  ChevronRight,
  Star,
  CheckCircle
} from 'lucide-react';

const LandingPage = () => {
  const [, navigate] = useLocation();

  const features = [
    {
      icon: <Calendar className="w-8 h-8 text-blue-600" />,
      title: "Smart Appointment Scheduling",
      description: "Efficient appointment management with automated reminders and conflict detection."
    },
    {
      icon: <FileText className="w-8 h-8 text-green-600" />,
      title: "Digital Medical Records",
      description: "Comprehensive patient records with easy access to medical history and treatment plans."
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Staff Management",
      description: "Streamlined staff scheduling, role management, and performance tracking."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
      title: "Analytics & Insights",
      description: "Data-driven insights to help grow your practice and improve patient care."
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Secure & Compliant",
      description: "HIPAA-compliant platform ensuring the highest standards of data security."
    },
    {
      icon: <Heart className="w-8 h-8 text-pink-600" />,
      title: "Patient Care Focus",
      description: "Tools designed to enhance patient care and improve treatment outcomes."
    }
  ];

  const stats = [
    { number: "500+", label: "Happy Veterinarians" },
    { number: "10K+", label: "Patients Managed" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support Available" }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Veterinary Clinic Owner",
      content: "This platform has revolutionized how we manage our clinic. The appointment scheduling and patient records are incredibly intuitive.",
      rating: 5
    },
    {
      name: "Dr. Michael Chen",
      role: "Associate Veterinarian",
      content: "The digital records system has made it so much easier to track patient history and collaborate with my team.",
      rating: 5
    },
    {
      name: "Lisa Martinez",
      role: "Clinic Administrator",
      content: "Staff management has never been easier. The scheduling and analytics features are game-changers for our practice.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">VetDashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Modern Veterinary
              <span className="text-blue-600 block">Practice Management</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline your veterinary practice with our comprehensive dashboard. 
              Manage appointments, patient records, staff, and analytics all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center"
              >
                Start Free Trial
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
              <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Practice
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools you need to deliver exceptional veterinary care.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Veterinary Professionals
            </h2>
            <p className="text-xl text-gray-600">
              See what our users have to say about VetDashboard
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-500 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of veterinary professionals who trust VetDashboard to manage their practice efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Start Your Free Trial
            </button>
            <button className="border border-blue-400 hover:bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <Stethoscope className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold text-white">VetDashboard</span>
              </div>
              <p className="text-gray-400 mb-4">
                The modern solution for veterinary practice management. 
                Streamline your workflow and focus on what matters most - your patients.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Training</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VetDashboard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
