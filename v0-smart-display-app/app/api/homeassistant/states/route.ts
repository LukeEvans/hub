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
    if (!haClient.isConfigured()) {
      return NextResponse.json({ entities: getMockStates(), areas: [], areaEntities: {} });
    }

    const cacheKey = 'ha:states';
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const [entities, areas, areaEntities] = await Promise.all([
      haClient.getStates(),
      haClient.getAreas(),
      haClient.getAreaEntities(),
    ]);

    const payload = { entities, areas, areaEntities };
    const ttl = parseInt(process.env.HOME_ASSISTANT_CACHE_TTL || '5');
    cache.set(cacheKey, payload, ttl);

    return NextResponse.json(payload);
  } catch (err: any) {
    console.error('Home Assistant states error:', err.message);
    return NextResponse.json({ 
      entities: getMockStates(), 
      areas: [], 
      areaEntities: {},
      error: err.message 
    }, { status: 500 });
  }
}

