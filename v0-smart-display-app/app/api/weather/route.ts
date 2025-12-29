import { NextResponse } from 'next/server';
import axios from 'axios';
import cache from '@/lib/cache';

function getMockWeather() {
  const now = Math.floor(Date.now() / 1000);
  const day = (offset: number, main: string) => ({
    dt: now + offset * 86400,
    temp: { min: 65 + offset, max: 75 + offset },
    weather: [{ main }],
  });
  return {
    current: { temp: 72, weather: [{ main: 'Clear', description: 'Mock data' }] },
    daily: [day(1, 'Clouds'), day(2, 'Rain'), day(3, 'Clear'), day(4, 'Wind')],
  };
}

export async function GET() {
  try {
    const lat = process.env.WEATHER_LAT;
    const lon = process.env.WEATHER_LON;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!lat || !lon || !apiKey) {
      return NextResponse.json(getMockWeather());
    }

    const cacheKey = `weather:${lat}:${lon}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const resp = await axios.get(
      'https://api.openweathermap.org/data/2.5/onecall',
      {
        params: {
          lat,
          lon,
          units: process.env.WEATHER_UNITS || 'imperial',
          appid: apiKey,
        },
      }
    );
    
    const payload = resp.data;
    cache.set(cacheKey, payload, 300);
    return NextResponse.json(payload);
  } catch (err: any) {
    console.error('Weather error', err.response?.data || err.message);
    return NextResponse.json(getMockWeather());
  }
}

