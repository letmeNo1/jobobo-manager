
import React from 'react';
import Layout from '../components/Layout';
import Input from '../components/Input';
import { Screen } from '../types';

interface SignUpProps {
  onNavigate: (screen: Screen) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onNavigate }) => {
  return (
    <Layout className="px-8 pt-10">
      <div className="flex justify-center mb-10">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl p-1 border border-gray-100 flex items-center justify-center overflow-hidden">
          <img 
            src="https://picsum.photos/seed/Jabobo/200/200" 
            alt="Jabobo Logo" 
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">Create Account</h1>

      <div className="space-y-4">
        <Input label="Full Name" placeholder="John Doe" />
        <Input label="Email" type="email" placeholder="john@example.com" />
        <Input label="Password" type="password" placeholder="Create a password" />
      </div>

      <button 
        onClick={() => onNavigate('LOGIN')}
        className="w-full bg-gray-800 text-white py-4 rounded-2xl font-bold text-lg mt-8 shadow-sm"
      >
        Create Account
      </button>

      <div className="mt-6 text-center">
        <button 
          onClick={() => onNavigate('LOGIN')}
          className="text-gray-500 text-sm"
        >
          Already have an account? <span className="text-yellow-500 font-bold">Log in</span>
        </button>
      </div>
    </Layout>
  );
};

export default SignUp;
