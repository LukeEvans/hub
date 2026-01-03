import { NextResponse } from 'next/server';
import axios from 'axios';
import cache from '@/lib/cache';

const TEAMS = {
  nba: 'den',
  nfl: 'den',
  nhl: 'col'
};

const LEAGUES = {
  nba: 'basketball',
  nfl: 'football',
  nhl: 'hockey'
};

async function fetchTeamData(league: string, sport: string, teamId: string) {
  const teamUrl = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${teamId}`;
  const now = new Date();
  const currentYear = now.getFullYear();
  const seasonYear = now.getMonth() >= 8 ? currentYear + 1 : currentYear;
  const scheduleUrl = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${teamId}/schedule?season=${seasonYear}`;
  const altUrl = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${teamId}/schedule`;

  try {
    const [teamResponse, scheduleResponse, altResponse] = await Promise.all([
      axios.get(teamUrl, { timeout: 5000 }),
      axios.get(scheduleUrl, { timeout: 5000 }).catch(() => ({ data: { events: [] } })),
      axios.get(altUrl, { timeout: 5000 }).catch(() => ({ data: { events: [] } }))
    ]);

    let events = scheduleResponse.data.events || scheduleResponse.data.team?.schedule || [];

    // If primary schedule is empty, try the alt schedule
    if (events.length === 0) {
      events = altResponse.data.events || altResponse.data.team?.schedule || [];
    }

    // If still empty, try the team endpoint's nextEvent
    if (events.length === 0) {
      events = teamResponse.data.team.nextEvent || [];
    }

    // Deduplicate and sort by date
    const seen = new Set();
    const uniqueEvents = events.filter((event: any) => {
      const id = event.id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      ...teamResponse.data.team,
      fullSchedule: uniqueEvents
    };
  } catch (e) {
    console.error(`Error fetching data for ${teamId}:`, e);
    // Fallback: try just the team info if it didn't fail
    try {
      const teamResponse = await axios.get(teamUrl, { timeout: 5000 });
      return {
        ...teamResponse.data.team,
        fullSchedule: teamResponse.data.team.nextEvent || []
      };
    } catch (fallbackError) {
      return { id: teamId, fullSchedule: [] };
    }
  }
}

function pruneTeamData(team: any) {
  return {
    id: team.id,
    name: team.name,
    displayName: team.displayName,
    logos: team.logos?.map((l: any) => ({ href: l.href })),
    record: team.record,
    nextEvent: team.nextEvent,
    fullSchedule: team.fullSchedule?.map((event: any) => ({
      id: event.id,
      date: event.date,
      competitions: [{
        id: event.competitions[0].id,
        date: event.competitions[0].date,
        status: {
          type: {
            name: event.competitions[0].status.type.name
          }
        },
        broadcasts: event.competitions[0].broadcasts,
        geoBroadcasts: event.competitions[0].geoBroadcasts,
        venue: {
          fullName: event.competitions[0].venue?.fullName,
          address: event.competitions[0].venue?.address
        },
        competitors: event.competitions[0].competitors.map((c: any) => ({
          id: c.id,
          homeAway: c.homeAway,
          score: c.score,
          records: c.records,
          record: c.record,
          team: {
            id: c.team.id,
            displayName: c.team.displayName,
            shortDisplayName: c.team.shortDisplayName,
            logos: c.team.logos?.map((l: any) => ({ href: l.href }))
          }
        }))
      }]
    }))
  };
}

export async function GET() {
  const cacheKey = 'sports-data-v7';
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const [nba, nfl, nhl] = await Promise.all([
      fetchTeamData('nba', 'basketball', TEAMS.nba),
      fetchTeamData('nfl', 'football', TEAMS.nfl),
      fetchTeamData('nhl', 'hockey', TEAMS.nhl)
    ]);

    const data = {
      nba: pruneTeamData(nba),
      nfl: pruneTeamData(nfl),
      nhl: pruneTeamData(nhl)
    };

    cache.set(cacheKey, data, 14400); // 4 hours
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=14400, stale-while-revalidate=28800'
      }
    });
  } catch (error: any) {
    console.error('Error fetching sports data:', error.message);
    return NextResponse.json({ error: 'Failed to fetch sports data' }, { status: 500 });
  }
}
