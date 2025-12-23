import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the Gemini API with your secret key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    // 1. Get the data sent from your frontend form
    const body = await req.json();
    const { frequency, goal, type } = body;

    // 2. MODULAR LOGIC: Decide which "Persona" to use
    let systemPrompt = "";
    
    if (type === 'fitness') {
      systemPrompt = `You are an elite fitness coach. Create a highly personalized 
      workout plan for a user who wants to work out ${frequency} days a week. 
      Their main goal is: ${goal}. Format the response with clear headings for each day.`;
    } else if (type === 'cooking') {
      systemPrompt = `You are a professional chef...`; // We can add this later!
    }

    // 3. Talk to the Gemini 1.5 Flash model (it's fast and efficient)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    // 4. Send the AI's answer back to the frontend
    return NextResponse.json({ output: responseText });

  } catch (error) {
    console.error("API Error:", error);

    // Check if it's a Quota/429 error
    if (error.status === 429) {
        return NextResponse.json({ 
            error: "The AI is currently 'resting' due to high demand. Please try again in 30 seconds!" 
        }, { status: 429 });
    }

    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}