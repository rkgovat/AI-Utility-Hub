import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the Gemini API with your secret key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    // 1. Get the data sent from your frontend form
    const body = await req.json();

    // Destructure all the new fields
    const { frequency, goal, type, experience, equipment, injuries, split, notes, isFollowUp, context, prompt } = body;

    // 2. MODULAR LOGIC: Decide which "Persona" to use
    let systemPrompt = "";

    // --- CASE 1: FOLLOW-UP CHAT ---
    if (isFollowUp) {
      systemPrompt = `
        You are an elite fitness coach assisting a client with their current plan.
        
        CURRENT PLAN:
        ${context}

        CLIENT QUESTION:
        ${prompt}

        INSTRUCTIONS:
        1. Answer the question specifically based on the plan provided above.
        2. If they ask for swaps, ensure they match the equipment constraints.
        3. Keep your response concise and professional.
      `;
    } 
    // --- CASE 2: INITIAL PLAN GENERATION ---
    else if (type === 'fitness') {
      systemPrompt = `You are an elite fitness coach. Create a personalized workout plan.
      
      USER PROFILE:
      - Frequency: ${frequency} days/week
      - Goal: ${goal}
      - Experience Level: ${experience}
      - Equipment Access: ${equipment}
      - Injuries/Limitations: ${injuries || "None"}
      - Preferred Split: ${split}
      - Additional Notes: ${notes || "None"}

      IMPORTANT FORMATTING RULES:
      1. Use bold headers for days (e.g., **Day 1: Upper Body**).
      2. Use bullet points for exercises.
      3. IMPORTANT: Place a horizontal rule (---) between every day or major section to ensure clear visual separation.
      4. For every specific exercise mentioned, create a Markdown link that searches YouTube for a tutorial.
        Example format: [🎥 Watch Bench Press Demo](https://www.youtube.com/results?search_query=how+to+do+barbell+bench+press)
      5. Keep the tone encouraging but professional.`;
    } else if (type === 'cooking') {
      systemPrompt = `You are a professional chef...`; // We can add this later!
    }

    // 3. Talk to the Gemini 2.0 Flash model (it's fast and efficient)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    // 4. Send the AI's answer back to the frontend
    return NextResponse.json({ output: responseText });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}