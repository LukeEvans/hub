import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { authClient, getGoogleToken } from '@/lib/google-auth';
import cache from '@/lib/cache';

function getMockCalendarEvents() {
  const now = new Date();
  const events = [];
  
  const build = (offset: number, startHour: number, endHour: number, summary: string) => {
    const start = new Date(now);
    start.setDate(now.getDate() + offset);
    start.setHours(startHour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(endHour, 0, 0, 0);
    return {
      id: `mock-${offset}-${startHour}-${summary.replace(/\s+/g, '-')}`,
      calendarId: 'mock',
      summary,
      start: start.toISOString(),
      end: end.toISOString(),
    };
  };

  const buildAllDay = (offset: number, summary: string) => {
    const date = new Date(now);
    date.setDate(now.getDate() + offset);
    const dateStr = date.toISOString().split('T')[0];
    return {
      id: `mock-allday-${offset}-${summary.replace(/\s+/g, '-')}`,
      calendarId: 'mock',
      summary,
      start: dateStr,
      end: dateStr,
    };
  };

  const activities = [
    'Coffee with Alex', 'Lunch Break', 'Planning Session', 'Dinner Out',
    'Gym Session', 'Project Review', 'Doctor Appointment', 'Grocery Shopping',
    'Call with Mom', 'Watch Movie', 'Reading Time', 'Walk the Dog',
    'Yoga Class', 'Coding Practice', 'Team Sync', 'Laundry'
  ];

  // Generate 60 days of events (prev 30, next 30)
  for (let d = -30; d < 30; d++) {
    // Add 1-2 all-day events every few days
    if (d % 3 === 0) {
      events.push(buildAllDay(d, `All-day Event ${d}`));
    }
    
    const numEvents = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < numEvents; i++) {
      const startHour = 8 + (i * 3);
      const activity = activities[Math.abs(d * numEvents + i) % activities.length];
      events.push(build(d, startHour, startHour + 1, activity));
    }
  }
  return events;
}

export async function GET(request: NextRequest) {
  try {
    const token = await getGoogleToken();
    const googleConfigured = Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && token
    );

    if (!googleConfigured) {
      return NextResponse.json({ events: getMockCalendarEvents() });
    }

    const searchParams = request.nextUrl.searchParams;
    const now = new Date();
    const timeMin = searchParams.get('start') || now.toISOString();
    const timeMax = searchParams.get('end') || new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    
    const calendarIds = (process.env.GOOGLE_CALENDAR_IDS || 'primary')
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const cacheKey = `events:${timeMin}:${timeMax}:${calendarIds.join(',')}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const calendar = google.calendar({ version: 'v3', auth: authClient });
    const events: any[] = [];

    for (const calendarId of calendarIds) {
      const resp = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });
      
      if (resp.data.items) {
        events.push(
          ...resp.data.items.map((e: any) => ({
            id: e.id,
            calendarId,
            summary: e.summary,
            start: e.start?.dateTime || e.start?.date,
            end: e.end?.dateTime || e.end?.date,
            location: e.location,
            description: e.description,
          }))
        );
      }
    }

    const payload = { events };
    cache.set(cacheKey, payload, 120);
    return NextResponse.json(payload);
  } catch (err) {
    console.error('Calendar error', err);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

