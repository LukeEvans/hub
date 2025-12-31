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
  const hour = (offset: number, main: string) => ({
    dt: now + offset * 3600,
    temp: 70 + offset,
    weather: [{ main }],
  });
  return {
    current: {
      temp: 72,
      feels_like: 70,
      humidity: 45,
      wind_speed: 5,
      visibility: 10000,
      pressure: 1013,
      weather: [{ main: 'Clear', description: 'Mock data' }]
    },
    daily: [
      { dt: now, temp: { min: 65, max: 75 }, weather: [{ main: 'Clear' }] },
      day(1, 'Clouds'),
      day(2, 'Rain'),
      day(3, 'Clear'),
      day(4, 'Wind'),
      day(5, 'Clouds'),
      day(6, 'Clear'),
      day(7, 'Clear'),
    ],
    hourly: Array.from({ length: 24 }, (_, i) => hour(i, i % 3 === 0 ? 'Clouds' : 'Clear'))
  };
}

export async function GET() {
  try {
    const lat = process.env.WEATHER_LAT;
    const lon = process.env.WEATHER_LON;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!lat || !lon || !apiKey || apiKey === 'your-openweather-key') {
      return NextResponse.json(getMockWeather());
    }

    const cacheKey = `weather:${lat}:${lon}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const resp = await axios.get(
      'https://api.openweathermap.org/data/3.0/onecall',
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
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (err: any) {
    console.error('Weather error', err.response?.data || err.message);
    return NextResponse.json(getMockWeather());
  }
}

