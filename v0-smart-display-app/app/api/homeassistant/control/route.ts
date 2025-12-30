import { NextResponse } from 'next/server';
import { haClient } from '@/lib/homeassistant';
import cache from '@/lib/cache';

export async function POST(request: Request) {
  try {
    if (!haClient.isConfigured()) {
      return NextResponse.json({ message: 'Home Assistant not configured' }, { status: 400 });
    }

    const body = await request.json();
    const { domain, service, serviceData } = body;

    if (!domain || !service) {
      return NextResponse.json({ message: 'Missing domain or service' }, { status: 400 });
    }

    const result = await haClient.callService(domain, service, serviceData || {});
    
    // Invalidate states cache so next fetch gets updated data
    cache.del('ha:states');

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Home Assistant control error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

