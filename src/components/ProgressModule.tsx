import React, { useState, useEffect } from 'react';
import { Button, Card } from './UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, TrendingUp, Award, BookOpen, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface TestResult {
  id: number;
  userId: number;
  score: number;
  totalQuestions: number;
  date: string;
  level: string;
  fileName: string;
}

export const ProgressModule = ({ user, onBack }: { user: any, onBack: () => void }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [user.id]);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/results/${user.id}`);
      const data = await response.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (error) {
      console.error("Failed to fetch results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = results.map((r, i) => ({
    name: `Test ${results.length - i}`,
    score: Math.round((r.score / r.totalQuestions) * 100),
    original: r
  })).reverse();

  const averageScore = results.length > 0 
    ? Math.round(results.reduce((acc, r) => acc + (r.score / r.totalQuestions), 0) / results.length * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Progress Report</h1>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p>Loading your progress...</p>
          </div>
        ) : results.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="mx-auto mb-4 text-gray-300" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No tests taken yet</h2>
            <p className="text-gray-500 mb-8">Complete a test in the Test Module to see your progress here.</p>
            <Button onClick={onBack}>Back to Dashboard</Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
                </div>
              </Card>
              <Card className="p-6 flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-2xl text-purple-600">
                  <Award size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Tests Taken</p>
                  <p className="text-2xl font-bold text-gray-900">{results.length}</p>
                </div>
              </Card>
              <Card className="p-6 flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-2xl text-green-600">
                  <BookOpen size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Total Questions</p>
                  <p className="text-2xl font-bold text-gray-900">{results.reduce((acc, r) => acc + r.totalQuestions, 0)}</p>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 p-8">
                <h3 className="text-xl font-bold mb-8">Your Progress Overview</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} unit="%" />
                      <Tooltip 
                        cursor={{ fill: '#f3f4f6' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.score > 80 ? '#2563eb' : '#6366f1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-8">
                <h3 className="text-xl font-bold mb-6">Recent Grades</h3>
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                  {results.map((test, i) => {
                    const percentage = Math.round((test.score / test.totalQuestions) * 100);
                    return (
                      <div key={i} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0">
                        <div className="flex-1 mr-4">
                          <p className="font-bold text-gray-900 truncate" title={test.fileName}>{test.fileName}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(test.date).toLocaleDateString()} • {test.level}
                          </p>
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-sm font-bold shrink-0",
                          percentage > 80 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {percentage}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
