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

async function fetchTeamData(league: string, sport: string, team: string) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${team}`;
  const response = await axios.get(url);
  return response.data;
}

export async function GET() {
  const cacheKey = 'sports-data';
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const [nba, nfl, nhl] = await Promise.all([
      fetchTeamData('nba', 'basketball', TEAMS.nba),
      fetchTeamData('nfl', 'football', TEAMS.nfl),
      fetchTeamData('nhl', 'hockey', TEAMS.nhl)
    ]);

    const data = {
      nba: nba.team,
      nfl: nfl.team,
      nhl: nhl.team
    };

    cache.set(cacheKey, data, 900); // 15 minutes
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching sports data:', error.message);
    return NextResponse.json({ error: 'Failed to fetch sports data' }, { status: 500 });
  }
}

