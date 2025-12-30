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
  const teamResponse = await axios.get(teamUrl);
  
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    // NBA/NHL/NFL seasons often cross years or are named by the year they end/primary year.
    // We'll try a few common patterns to get the full season.
    const seasonYear = now.getMonth() >= 8 ? currentYear + 1 : currentYear;
    
    // Attempt 1: Standard schedule endpoint with season year
    const scheduleUrl = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${teamId}/schedule?season=${seasonYear}`;
    let scheduleResponse = await axios.get(scheduleUrl);
    
    let events = scheduleResponse.data.events || scheduleResponse.data.team?.schedule || [];

    // Attempt 2: If Attempt 1 was empty, try without the season parameter
    if (events.length === 0) {
      const altUrl = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${teamId}/schedule`;
      const altResponse = await axios.get(altUrl);
      events = altResponse.data.events || altResponse.data.team?.schedule || [];
    }

    // Attempt 3: If still empty, try the team endpoint's nextEvent
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
    console.error(`Error fetching schedule for ${teamId}:`, e);
    return {
      ...teamResponse.data.team,
      fullSchedule: teamResponse.data.team.nextEvent || []
    };
  }
}

export async function GET() {
  const cacheKey = 'sports-data-v5';
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const [nba, nfl, nhl] = await Promise.all([
      fetchTeamData('nba', 'basketball', TEAMS.nba),
      fetchTeamData('nfl', 'football', TEAMS.nfl),
      fetchTeamData('nhl', 'hockey', TEAMS.nhl)
    ]);

    const data = {
      nba,
      nfl,
      nhl
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
