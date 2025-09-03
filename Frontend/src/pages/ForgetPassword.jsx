import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../Instance/api';
import { Loader, ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/user/forget-password', { email });
      
      if (response.status === 200) {
        toast.success('OTP sent to your email!');
        navigate('/reset-password', { state: { email } });
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C3333] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden border border-[#1C3333]/20"
      >
        <div className="bg-white p-8 text-center border-b border-[#1C3333]/20">
          <h1 className="text-2xl font-bold text-[#1C3333]">Reset Your Password</h1>
          <p className="mt-2 text-[#1C3333]/80">
            Enter your email to receive a reset code
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-[#1C3333]">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#1C3333]/60" />
                </div>
                <input
                  type="email"
                  id="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#1C3333]/30 rounded-md focus:ring-2 focus:ring-[#1C3333] focus:border-[#1C3333] transition text-[#1C3333] bg-white"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className={`w-full py-3 cursor-pointer px-4 rounded-md font-medium text-white transition-colors ${
                loading
                  ? "bg-[#1C3333]/80 cursor-not-allowed"
                  : "bg-[#1C3333] hover:bg-[#1C3333]/90 shadow-sm"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="animate-spin h-5 w-5" />
                  Sending OTP...
                </span>
              ) : (
                'Send Reset Code'
              )}
            </motion.button>

            <div className="text-center mt-4">
              <Link
                to="/login"
                className="text-[#1C3333] cursor-pointer hover:text-[#1C3333]/70 font-medium flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to login
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgetPassword;