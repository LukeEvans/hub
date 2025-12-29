import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

function getEmptyRecipe() {
  return { name: 'Recipe unavailable', description: '', steps: [] };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const baseUrl = process.env.MEALIE_BASE_URL;
    const token = process.env.MEALIE_API_TOKEN;

    if (!baseUrl || !token) {
      return NextResponse.json(getEmptyRecipe());
    }

    const { id } = await params;
    const resp = await axios.get(`${baseUrl}/api/recipes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    return NextResponse.json(resp.data);
  } catch (err: any) {
    console.error('Mealie recipe error', err.response?.data || err.message);
    return NextResponse.json(getEmptyRecipe());
  }
}

