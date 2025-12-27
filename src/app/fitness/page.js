'use client';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function FitnessPage() {
  // 1. EXPANDED STATE
  const [formData, setFormData] = useState({ 
    frequency: '3-4', 
    goal: '',
    experience: 'Beginner',
    experience_custom: '',
    equipment: 'Full Gym',
    equipment_custom: '',
    injuries: '',
    split: 'Upper/Lower',
    split_custom: '',
    notes: ''
  });

  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('fitness_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");

    // 2. LOGIC: Resolve "Other" fields before sending
    // If they picked "Other", use the custom text. Otherwise, use the dropdown.
    const finalData = {
      frequency: formData.frequency,
      goal: formData.goal,
      injuries: formData.injuries,
      notes: formData.notes,
      experience: formData.experience === 'other' ? formData.experience_custom : formData.experience,
      equipment: formData.equipment === 'other' ? formData.equipment_custom : formData.equipment,
      split: formData.split === 'other' ? formData.split_custom : formData.split,
      type: 'fitness'
    };

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });
      const data = await res.json();
      
      if (data.output) {
        setResponse(data.output);
        
        const now = new Date();
        const newEntry = {
          id: Date.now(),
          date: now.toLocaleDateString(),
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          inputs: finalData, // <--- SAVING THE INPUTS HERE
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
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">🏋️ AI Fitness Coach</h1>
          <p className="text-slate-600">Complete the profile below for a precision plan.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ROW 1: Goal & Frequency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold text-slate-700 mb-2">Main Goal</label>
                <input type="text" name="goal" required placeholder="e.g. Build muscle, lose 10lbs..." onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-2">Days per week</label>
                <select name="frequency" onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg">
                  <option value="1-2">1-2 Days</option>
                  <option value="3-4">3-4 Days</option>
                  <option value="5+">5+ Days</option>
                </select>
              </div>
            </div>

            {/* ROW 2: Experience & Equipment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold text-slate-700 mb-2">Experience Level</label>
                <select name="experience" onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg mb-2">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="other">Other...</option>
                </select>
                {formData.experience === 'other' && (
                  <input type="text" name="experience_custom" placeholder="Describe your experience..." onChange={handleChange} className="w-full p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg outline-none" />
                )}
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-2">Access to Equipment</label>
                <select name="equipment" onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg mb-2">
                  <option value="Full Gym">Full Gym</option>
                  <option value="Limited Home Gym">Limited Home Gym</option>
                  <option value="Bodyweight Only">Bodyweight Only</option>
                  <option value="other">Other...</option>
                </select>
                {formData.equipment === 'other' && (
                  <input type="text" name="equipment_custom" placeholder="Describe your equipment..." onChange={handleChange} className="w-full p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg outline-none" />
                )}
              </div>
            </div>

            {/* ROW 3: Split & Injuries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold text-slate-700 mb-2">Preferred Split</label>
                <select name="split" onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg mb-2">
                  <option value="Upper/Lower">Upper / Lower</option>
                  <option value="Push/Pull/Legs">Push / Pull / Legs</option>
                  <option value="Full Body">Full Body</option>
                  <option value="other">Other...</option>
                </select>
                {formData.split === 'other' && (
                  <input type="text" name="split_custom" placeholder="Describe your preferred split..." onChange={handleChange} className="w-full p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg outline-none" />
                )}
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-2">Injuries / Limitations</label>
                <textarea name="injuries" placeholder="e.g. Bad left knee..." onChange={handleChange} rows="2" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            {/* ROW 4: Notes */}
            <div>
              <label className="block font-bold text-slate-700 mb-2">Optional Notes</label>
              <textarea name="notes" placeholder="Anything else?" onChange={handleChange} rows="3" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold text-lg text-white flex justify-center items-center gap-3 transition-all ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-lg"}`}>
              {loading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? "Designing Plan..." : "Create Workout Plan"}
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
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({node, ...props}) => <a {...props} className="text-blue-600 font-bold hover:underline" target="_blank" rel="noopener noreferrer" /> }}>
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
              <button onClick={clearHistory} className="text-sm text-red-500 hover:text-red-700 font-semibold underline">
                Clear History
              </button>
            </div>
            <div className="space-y-4">
              {history.map((item) => (
                <details key={item.id} className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <summary className="flex justify-between items-center p-5 cursor-pointer bg-slate-50 font-medium text-slate-700 group-hover:bg-slate-100">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">{item.date} • {item.time}</span>
                      <span className="font-bold text-slate-900 text-lg mt-1">{item.inputs ? item.inputs.goal : item.goal}</span>
                    </div>
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  
                  <div className="p-6 border-t border-slate-100 bg-gray-50">
                    
                    {/* NEW: DISPLAY USER INPUTS */}
                    {item.inputs && (
                      <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-slate-700">
                        <h4 className="font-bold text-blue-900 mb-2 border-b border-blue-200 pb-1">Plan Parameters</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                          <p><span className="font-semibold">Frequency:</span> {item.inputs.frequency} days/week</p>
                          <p><span className="font-semibold">Experience:</span> {item.inputs.experience}</p>
                          <p><span className="font-semibold">Equipment:</span> {item.inputs.equipment}</p>
                          <p><span className="font-semibold">Split:</span> {item.inputs.split}</p>
                          {item.inputs.injuries && (
                             <p className="md:col-span-2"><span className="font-semibold text-red-600">Injuries:</span> {item.inputs.injuries}</p>
                          )}
                          {item.inputs.notes && (
                             <p className="md:col-span-2"><span className="font-semibold">Notes:</span> {item.inputs.notes}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* AI RESPONSE */}
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({node, ...props}) => <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" /> }}>
                        {item.plan}
                      </ReactMarkdown>
                    </div>
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