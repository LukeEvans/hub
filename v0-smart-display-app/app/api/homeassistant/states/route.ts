import { NextResponse } from 'next/server';
import { haClient } from '@/lib/homeassistant';
import cache from '@/lib/cache';

function getMockStates() {
  return [
    {
      entity_id: 'light.living_room',
      state: 'on',
      attributes: { friendly_name: 'Living Room Lights', brightness: 255 },
    },
    {
      entity_id: 'light.kitchen',
      state: 'off',
      attributes: { friendly_name: 'Kitchen Lights' },
    },
    {
      entity_id: 'climate.main_thermostat',
      state: 'heat',
      attributes: {
        friendly_name: 'Main Thermostat',
        current_temperature: 72,
        temperature: 72,
      },
    },
    {
      entity_id: 'lock.front_door',
      state: 'locked',
      attributes: { friendly_name: 'Front Door' },
    },
    {
      entity_id: 'sensor.energy_usage',
      state: '2.4',
      attributes: { friendly_name: 'Energy Usage', unit_of_measurement: 'kW' },
    },
  ];
}

export async function GET() {
  try {
    const isConfigured = haClient.isConfigured();
    if (!isConfigured) {
      console.warn('Home Assistant NOT configured. URL or Token missing in environment.');
      return NextResponse.json({ 
        entities: getMockStates(), 
        areas: [], 
        areaEntities: {},
        isConfigured: false 
      });
    }

    const cacheKey = 'ha:states';
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached as object, isConfigured: true });
    }

    // Use individual try-catches to ensure one failure doesn't block everything
    let entities: any[] = [];
    let areas: any[] = [];
    let areaEntities: any = {};

    try {
      entities = await haClient.getStates();
    } catch (e: any) {
      console.error('Failed to fetch HA states:', e.message);
    }

    try {
      areas = await haClient.getAreas();
    } catch (e: any) {
      console.error('Failed to fetch HA areas:', e.message);
    }

    try {
      areaEntities = await haClient.getAreaEntities();
    } catch (e: any) {
      console.error('Failed to fetch HA area entities:', e.message);
    }

    const payload = { entities, areas, areaEntities };
    const ttl = parseInt(process.env.HOME_ASSISTANT_CACHE_TTL || '5');
    cache.set(cacheKey, payload, ttl);

    return NextResponse.json({ ...payload, isConfigured: true });
  } catch (err: any) {
    console.error('Home Assistant states route error:', err.message);
    return NextResponse.json({ 
      entities: getMockStates(), 
      areas: [], 
      areaEntities: {},
      isConfigured: true, // It was configured but failed to fetch
      error: err.message 
    }, { status: 500 });
  }
}

