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
  // The team endpoint gives us nextEvent and basic team info including record
  const teamResponse = await axios.get(teamUrl);
  
  // Try to fetch full schedule if available, otherwise fallback to nextEvent
  // Some sports/leagues support a dedicated schedule endpoint
  try {
    const scheduleUrl = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${teamId}/schedule`;
    const scheduleResponse = await axios.get(scheduleUrl);
    return {
      ...teamResponse.data.team,
      fullSchedule: scheduleResponse.data.events || teamResponse.data.team.nextEvent || []
    };
  } catch (e) {
    return {
      ...teamResponse.data.team,
      fullSchedule: teamResponse.data.team.nextEvent || []
    };
  }
}

export async function GET() {
  const cacheKey = 'sports-data-v2';
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

    cache.set(cacheKey, data, 900); // 15 minutes
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching sports data:', error.message);
    return NextResponse.json({ error: 'Failed to fetch sports data' }, { status: 500 });
  }
}
