import { NextResponse } from 'next/server';
import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Fetch the HTML content of the page
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const html = response.data;
    
    // Clean the HTML to remove script and style tags to fit more content
    const cleanedHtml = typeof html === 'string' 
      ? html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/\s+/g, ' ')
            .trim()
      : '';
    
    // Use OpenAI to parse the recipe
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-5.2',
        messages: [
          {
            role: 'system',
            content: `You are a professional executive chef and recipe parser. Extract recipe information from the provided HTML. 
            
            Reorganize the instructions into a logical, expert culinary sequence:
            1. PREP FIRST: Start with preheating the oven, preparing pans, and critical mise en place (e.g., "finely chop the onions").
            2. COOKING FLOW: Ensure the cooking steps follow a logical progression that an expert chef would follow.
            3. CONSISTENCY: Ensure ingredients match the steps they are used in.

            Return a JSON object with the following structure:
            {
              "name": "Recipe Name",
              "description": "Short description",
              "totalTime": "e.g. 45 mins",
              "yield": "e.g. 4 servings",
              "ingredients": [
                { "item": "flour", "amount": "2", "unit": "cups", "note": "all-purpose", "stepIndices": [0, 1] }
              ],
              "instructions": [
                { "text": "Step 1 text", "stepNumber": 1 }
              ],
              "imageUrl": "URL to the main recipe image if found"
            }
            Important: "stepIndices" MUST be an accurate array of instruction indices (0-based) where this ingredient is used. 
            If an ingredient is used in multiple steps, include all those indices.
            Normalize units (cups, tbsp, tsp, g, kg, ml, l).`
          },
          {
            role: 'user',
            content: `Parse this recipe into an expert chef's sequence from the following HTML: ${cleanedHtml.substring(0, 100000)}` // gpt-5.2 handles larger context
          }
        ],
        response_format: { type: "json_object" },
        reasoning_effort: "medium"
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const recipeData = JSON.parse(openaiResponse.data.choices[0].message.content);
    
    return NextResponse.json({ 
      ...recipeData,
      id: Math.random().toString(36).substring(2, 9),
      sourceUrl: url,
      createdAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Recipe parsing error:', error.message);
    return NextResponse.json({ 
      error: 'Failed to parse recipe', 
      details: error.response?.data?.error?.message || error.message 
    }, { status: 500 });
  }
}

