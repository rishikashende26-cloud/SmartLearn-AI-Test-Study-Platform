import React, { useState, useRef } from 'react';
import { Button, Card } from './UI';
import { FileText, Send, Home, Loader2, Upload, FileCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { generateSummary } from '../services/aiService';
import { extractTextFromPDF } from '../lib/pdfUtils';
import { cn } from '../lib/utils';

export const SummaryModule = ({ onBack }: { onBack: () => void }) => {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState<{ keyPoints: string[], revisionPoints: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsExtracting(true);
    try {
      if (file.type === 'application/pdf') {
        const extractedText = await extractTextFromPDF(file);
        setText(extractedText);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          setText(event.target?.result as string);
        };
        reader.readAsText(file);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to extract text from file.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSummarize = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const data = await generateSummary(text);
      setSummary(data);
    } catch (error) {
      console.error(error);
      alert("Failed to generate summary.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Notes Summarization</h1>
          </div>
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <Home size={18} /> Home
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <Card className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h3 className="font-bold text-gray-900">Upload Notes or Paste Text</h3>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.txt"
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isExtracting}
                  className="gap-2"
                >
                  {isExtracting ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                  {fileName ? 'Change File' : 'Upload PDF/Text'}
                </Button>
              </div>
            </div>

            {fileName && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 text-blue-700 text-sm">
                <FileCheck size={16} />
                Loaded: <span className="font-bold">{fileName}</span>
              </div>
            )}

            <textarea
              className="w-full h-64 p-6 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none mb-6"
              placeholder="Paste your notes here or upload a file above..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex gap-4">
              <Button 
                className="px-8 py-3" 
                disabled={isLoading || isExtracting || !text.trim()}
                onClick={handleSummarize}
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" size={18} />}
                Summarize
              </Button>
              <Button variant="outline" onClick={() => {
                setText('');
                setFileName(null);
                setSummary(null);
              }}>Clear</Button>
            </div>
          </Card>

          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-8 border-l-4 border-blue-500">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Key Points</h3>
                <ul className="space-y-4">
                  {summary.keyPoints.map((point, i) => (
                    <li key={i} className="flex gap-3 text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-8 border-l-4 border-orange-500">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Important Points to Revise</h3>
                <ul className="space-y-4">
                  {summary.revisionPoints.map((point, i) => (
                    <li key={i} className="flex gap-3 text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
