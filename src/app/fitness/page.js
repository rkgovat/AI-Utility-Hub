'use client'; // This tells Next.js this page uses "State" (interactivity)
import { useState } from 'react';

export default function FitnessPage() {
  // 1. STATE: This is the "Memory" of our form
  const [formData, setFormData] = useState({
    frequency: '3',
    goal: '',
    experience: 'beginner'
  });

  const [response, setResponse] = useState(""); // Stores the AI's answer

  // 2. HANDLER: This updates the "Memory" when you type
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. SUBMIT: This talks to Gemini
  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponse("Crunching the numbers... your plan is coming!");

    const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            frequency: formData.frequency, 
            goal: formData.goal,
            type: 'fitness' // This tells the backend to use the fitness prompt!
        }),
    });
    
    const data = await res.json();

    if (data.error) {
        setResponse(data.error); // Show the specific "Resting" message to the user
    } else {
        setResponse(data.output);
    }
    
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">AI Fitness Coach</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block font-medium">Days per week:</label>
          <select 
            name="frequency" 
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="1-2">1-2 days</option>
            <option value="3-4">3-4 days</option>
            <option value="5+">5+ days</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">What is your main goal?</label>
          <input 
            type="text" 
            name="goal" 
            placeholder="e.g. Build muscle, lose weight, run a 5k"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Generate Workout Plan
        </button>
      </form>

      {/* This is where the AI response will appear */}
      {response && (
        <div className="mt-8 p-6 bg-gray-50 border rounded-lg">
          <h2 className="font-bold mb-2">Your Plan:</h2>
          <p className="whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
}