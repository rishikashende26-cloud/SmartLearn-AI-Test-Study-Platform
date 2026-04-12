import React from 'react';
import { Card } from './UI';
import { BookOpen, FileText, Calendar, BarChart3, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  user: any;
  onNavigate: (view: any) => void;
  onLogout: () => void;
}

export const Dashboard = ({ user, onNavigate, onLogout }: DashboardProps) => {
  const menuItems = [
    { id: 'test', title: 'Take Test', desc: 'Start a test to assess your knowledge', icon: BookOpen, color: 'bg-blue-500' },
    { id: 'summary', title: 'Summarize Notes', desc: 'Get quick summaries of your notes', icon: FileText, color: 'bg-orange-500' },
    { id: 'schedule', title: 'Study Schedule', desc: 'Generate a personalized study plan', icon: Calendar, color: 'bg-green-500' },
    { id: 'progress', title: 'Track Progress', desc: 'View your learning insights', icon: BarChart3, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-2xl font-bold text-blue-600">SmartLearn</h1>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>

        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-600 rounded-3xl p-8 md:p-12 text-white mb-12 relative overflow-hidden shadow-lg"
        >
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-2 flex items-center gap-3">
              Welcome, {user.username || user.name || 'Student'} 👋
            </h2>
            <p className="text-blue-100 text-xl">What would you like to do today?</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        </motion.div>

        {/* Grid Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="p-6 cursor-pointer hover:shadow-md transition-all group border-transparent hover:border-blue-200"
              >
                <div className="flex items-center gap-6" onClick={() => onNavigate(item.id)}>
                  <div className={`${item.color} p-4 rounded-2xl text-white group-hover:scale-110 transition-transform`}>
                    <item.icon size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-500">{item.desc}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
