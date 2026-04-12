import React, { useState, useRef, useEffect } from 'react';
import { Button, Card } from './UI';
import { Upload, Camera, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import { generateTest, analyzeProctoringFrame } from '../services/aiService';
import { extractTextFromPDF } from '../lib/pdfUtils';
import { cn } from '../lib/utils';

export const TestModule = ({ user, onBack }: { user: any, onBack: () => void }) => {
  const [step, setStep] = useState<'setup' | 'exam' | 'result'>('setup');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [warnings, setWarnings] = useState(0);
  const [proctoringReason, setProctoringReason] = useState<string | null>(null);
  const [isCheating, setIsCheating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [webcamReady, setWebcamReady] = useState(false);

  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    if (step === 'result') {
      saveResult();
    }
  }, [step]);

  const saveResult = async () => {
    const score = calculateScore();
    const resultData = {
      userId: user.id,
      score: score,
      totalQuestions: questions.length,
      date: new Date().toISOString(),
      level: level,
      fileName: file?.name || 'Unknown'
    };

    try {
      await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData),
      });
    } catch (error) {
      console.error("Failed to save test result:", error);
    }
  };

  const handleWebcamError = (error: any) => {
    console.error("Webcam error:", error);
    setWebcamError(error?.message || "Could not access camera. Please check permissions.");
    setWebcamReady(false);
  };

  const handleWebcamReady = () => {
    console.log("Webcam ready");
    setWebcamReady(true);
    setWebcamError(null);
  };

  // Timer logic
  useEffect(() => {
    if (step === 'exam' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (step === 'exam' && timeLeft === 0) {
      setStep('result');
    }
  }, [step, timeLeft]);

  // AI Proctoring
  useEffect(() => {
    if (step === 'exam' && webcamReady) {
      const interval = setInterval(async () => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            const result = await analyzeProctoringFrame(imageSrc);
            if (result.isViolating) {
              setProctoringReason(result.reason);
              setWarnings(prev => {
                const next = prev + 1;
                if (next >= 3) {
                  setStep('result');
                  setIsCheating(true);
                }
                return next;
              });
              // Clear reason after 5 seconds
              setTimeout(() => setProctoringReason(null), 5000);
            }
          }
        }
      }, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
    }
  }, [step, webcamReady]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const startExam = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      const text = await extractTextFromPDF(file);
      const data = await generateTest(text, level);
      setQuestions(data.questions);
      setStep('exam');
    } catch (error) {
      console.error(error);
      alert("Failed to generate test. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) score++;
    });
    return score;
  };

  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-blue-600">SmartLearn</h1>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={onBack}>Back</Button>
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium">
                Setup Mode
              </div>
            </div>
          </div>

          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-8">Select Level</h2>
            <div className="grid grid-cols-3 gap-4 mb-12">
              {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l as any)}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all text-center font-bold",
                    level === l 
                      ? "border-blue-600 bg-blue-50 text-blue-600" 
                      : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center mb-8">
              <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} accept=".pdf,.ppt,.doc,.docx" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="text-blue-600" />
                </div>
                <h3 className="text-lg font-bold mb-1">Upload Notes (PDF / PPT / DOC)</h3>
                <p className="text-gray-400 mb-6">{file ? file.name : 'Drag and drop or click to browse'}</p>
                <Button variant="primary" className="px-8" onClick={() => document.getElementById('file-upload')?.click()}>
                  Select File
                </Button>
              </label>
            </div>

            <Button 
              className="w-full py-4 text-lg" 
              disabled={!file || isLoading}
              onClick={startExam}
            >
              {isLoading ? 'Generating Test...' : 'Proceed to Exam'}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'exam') {
    const q = questions[currentQuestion];
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
          {/* Proctoring Sidebar */}
          <div className="w-full md:w-80 space-y-6">
            <Card className="p-6 text-center">
              <h3 className="font-bold text-gray-900 mb-4">AI Proctoring</h3>
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-black mb-4 flex items-center justify-center">
                {!webcamError ? (
                  <Webcam 
                    audio={false}
                    ref={webcamRef} 
                    className="w-full h-full object-cover" 
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "user" }}
                    mirrored={true}
                    disablePictureInPicture={true}
                    forceScreenshotSourceSize={true}
                    imageSmoothing={true}
                    onUserMedia={handleWebcamReady}
                    onUserMediaError={handleWebcamError}
                    screenshotQuality={0.8}
                  />
                ) : (
                  <div className="p-4 text-white text-xs">
                    <AlertTriangle className="mx-auto mb-2 text-red-500" />
                    <p>{webcamError}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4 text-white border-white hover:bg-white/10"
                      onClick={() => setWebcamError(null)}
                    >
                      Retry Camera
                    </Button>
                  </div>
                )}
                {webcamReady && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  </div>
                )}
              </div>
              <p className={cn("text-sm font-medium mb-4", webcamReady ? "text-green-600" : "text-gray-400")}>
                {webcamReady ? "Face Detected" : "Camera Initializing..."}
              </p>
              
              <div className="bg-gray-900 text-white rounded-xl py-3 text-2xl font-mono mb-4">
                {formatTime(timeLeft)}
              </div>

              {warnings > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                    <AlertTriangle size={18} />
                    <span className="text-sm font-bold">Warning {warnings}/3</span>
                  </div>
                  {proctoringReason && (
                    <p className="text-xs text-red-500 font-medium italic">
                      Reason: {proctoringReason}
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Question Area */}
          <div className="flex-1">
            <Card className="p-8 min-h-[500px] flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <span className="text-blue-600 font-bold">Question {currentQuestion + 1} of {questions.length}</span>
                <div className="flex gap-2">
                  {questions.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "w-2 h-2 rounded-full",
                        idx === currentQuestion ? "bg-blue-600" : 
                        answers[idx] !== undefined ? "bg-green-400" : "bg-gray-200"
                      )} 
                    />
                  ))}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-8">{q?.question}</h2>

              <div className="space-y-4 flex-1">
                {q?.options.map((opt: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [currentQuestion]: idx })}
                    className={cn(
                      "w-full p-5 rounded-2xl border-2 text-left transition-all font-medium",
                      answers[currentQuestion] === idx 
                        ? "border-blue-600 bg-blue-50 text-blue-700" 
                        : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-12">
                <Button 
                  variant="outline" 
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion(prev => prev - 1)}
                >
                  Previous
                </Button>
                {currentQuestion === questions.length - 1 ? (
                  <Button onClick={() => setStep('result')}>Submit Exam</Button>
                ) : (
                  <Button onClick={() => setCurrentQuestion(prev => prev + 1)}>
                    Next Question <ChevronRight size={18} className="ml-2" />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <Card className="max-w-md w-full p-12 text-center">
        <div className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6",
          isCheating ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
        )}>
          {isCheating ? <AlertTriangle size={48} /> : <Clock size={48} />}
        </div>
        <h2 className="text-3xl font-bold mb-2">
          {isCheating ? 'Exam Terminated' : 'Exam Completed'}
        </h2>
        <p className="text-gray-500 mb-8">
          {isCheating ? 'Multiple cheating warnings detected. Your session was auto-submitted.' : 'Well done! You have completed the test.'}
        </p>

        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <p className="text-sm text-gray-400 uppercase font-bold tracking-wider mb-1">Your Score</p>
          <p className="text-5xl font-bold text-blue-600">{calculateScore()} <span className="text-2xl text-gray-300">/ {questions.length}</span></p>
        </div>

        <Button className="w-full" onClick={onBack}>Return to Dashboard</Button>
      </Card>
    </div>
  );
};
