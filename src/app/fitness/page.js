'use client'; // This tells Next.js this page uses "State" (interactivity)
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function FitnessPage() {
  // 1. STATE: This is the "Memory" of our form
  const [formData, setFormData] = useState({ frequency: '3-4', goal: '' });
  const [response, setResponse] = useState(""); // Stores the AI's answer
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // Load History on Startup
  useEffect(() => {
    const saved = localStorage.getItem('fitness_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // 2. HANDLER: This updates the "Memory" when you type
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. SUBMIT: This talks to Gemini
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(""); // Clear previous result while loading

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: 'fitness' }), // This tells the backend to use the fitness prompt!
      });
      const data = await res.json();
      
      if (data.output) {
        setResponse(data.output);
        
        // 2. Save to History
        const newEntry = {
          id: Date.now(),
          date: new Date().toLocaleDateString(),
          goal: formData.goal,
          plan: data.output
        };
        const updatedHistory = [newEntry, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('fitness_history', JSON.stringify(updatedHistory));
      } else {
        setResponse(data.error || "Something went wrong.");
      }
    } catch (err) {
      setResponse("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('fitness_history');
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">🏋️ AI Fitness Coach</h1>
          <p className="text-slate-600">Generated plans with video tutorials included.</p>
        </div>

        {/* Input Form */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold text-slate-700 mb-2">Days per week</label>
                <select 
                  name="frequency" 
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="1-2">1-2 Days (Maintenance)</option>
                  <option value="3-4">3-4 Days (Growth)</option>
                  <option value="5+">5+ Days (Intense)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-2">Goal</label>
                <input 
                  type="text" 
                  name="goal" 
                  required
                  placeholder="e.g. Broad shoulders, run 5k..."
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all ${
                loading ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-lg"
              }`}
            >
              {loading ? "Generating Plan..." : "Create Workout Plan"}
            </button>
          </form>
        </div>

        {/* Active Result */}
        {response && (
          <div className="mt-8 bg-white p-8 rounded-2xl shadow-lg border-2 border-blue-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">🎯</span> Your Custom Plan
            </h2>
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({node, ...props}) => <a {...props} className="text-blue-600 font-bold hover:underline" target="_blank" rel="noopener noreferrer" />
                }}
              >
                {response}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-16">
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-2xl font-bold text-slate-800">History</h3>
              <button 
                onClick={clearHistory}
                className="text-sm text-red-500 hover:text-red-700 font-semibold underline"
              >
                Clear History
              </button>
            </div>
            
            <div className="space-y-4">
              {history.map((item) => (
                <details key={item.id} className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <summary className="flex justify-between items-center p-5 cursor-pointer bg-slate-50 font-medium text-slate-700 group-hover:bg-slate-100">
                    <span>{item.date} — <span className="font-bold text-slate-900">{item.goal}</span></span>
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="p-6 prose prose-sm max-w-none border-t border-slate-100">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({node, ...props}) => <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" />
                      }}
                    >
                      {item.plan}
                    </ReactMarkdown>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}