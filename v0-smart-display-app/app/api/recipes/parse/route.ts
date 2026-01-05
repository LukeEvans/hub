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
    
    // Use OpenAI to parse the recipe
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-5.2',
        messages: [
          {
            role: 'system',
            content: `You are a recipe parser. Extract recipe information from the provided HTML. 
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
            Important: "stepIndices" should be an array of instruction indices (0-based) where this ingredient is used. 
            If you cannot find specific indices, leave it empty.
            Normalize units (cups, tbsp, tsp, g, kg, ml, l).`
          },
          {
            role: 'user',
            content: `Parse this recipe from the following HTML: ${html.substring(0, 50000)}` // Limit HTML to avoid token limits
          }
        ],
        response_format: { type: "json_object" }
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

