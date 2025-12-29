const path = require('path');
const fs = require('fs/promises');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const cache = new NodeCache({ stdTTL: 300 });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const GOOGLE_TOKEN_PATH = process.env.GOOGLE_TOKEN_PATH || './data/google/token.json';

const authClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `http://localhost:${PORT}/api/google/oauth/callback`
);

async function getGoogleToken() {
  try {
    const data = await fs.readFile(GOOGLE_TOKEN_PATH, 'utf-8');
    const token = JSON.parse(data);
    authClient.setCredentials(token);
    return token;
  } catch {
    return null;
  }
}

async function saveGoogleToken(token) {
  await fs.mkdir(path.dirname(GOOGLE_TOKEN_PATH), { recursive: true });
  await fs.writeFile(GOOGLE_TOKEN_PATH, JSON.stringify(token));
}

function getMockCalendarEvents() {
  const now = new Date();
  const events = [];
  const build = (offset, startHour, endHour, summary) => {
    const start = new Date(now);
    start.setDate(now.getDate() + offset);
    start.setHours(startHour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(endHour, 0, 0, 0);
    return {
      id: `mock-${offset}-${startHour}`,
      calendarId: 'mock',
      summary,
      start: start.toISOString(),
      end: end.toISOString(),
    };
  };

  const activities = [
    'Coffee with Alex', 'Lunch Break', 'Planning Session', 'Dinner Out',
    'Gym Session', 'Project Review', 'Doctor Appointment', 'Grocery Shopping',
    'Call with Mom', 'Watch Movie', 'Reading Time', 'Walk the Dog',
    'Yoga Class', 'Coding Practice', 'Team Sync', 'Laundry'
  ];

  for (let d = 0; d < 14; d++) {
    const numEvents = 8;
    for (let i = 0; i < numEvents; i++) {
      const startHour = 8 + i;
      const activity = activities[(d * numEvents + i) % activities.length];
      events.push(build(d, startHour, startHour + 1, activity));
    }
  }
  return events;
}

function getMockWeather() {
  const now = Math.floor(Date.now() / 1000);
  const day = (offset, main) => ({
    dt: now + offset * 86400,
    temp: { min: 65 + offset, max: 75 + offset },
    weather: [{ main }],
  });
  return {
    current: { temp: 72, weather: [{ main: 'Clear', description: 'Mock data' }] },
    daily: [day(1, 'Clouds'), day(2, 'Rain'), day(3, 'Clear'), day(4, 'Wind')],
  };
}

function getEmptyMealPlan() {
  return { mealPlan: { meals: [] } };
}

function getEmptyRecipe() {
  return { name: 'Recipe unavailable', description: '', steps: [] };
}

app.get('/api/google/auth-url', async (_req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'openid',
    'email',
    'profile',
  ];
  const url = authClient.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
  res.json({ url });
});

app.get('/api/google/oauth/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Missing code');
  }
  try {
    const { tokens } = await authClient.getToken(code);
    await saveGoogleToken(tokens);
    res.send('Google auth completed. You can close this tab.');
  } catch (err) {
    console.error('OAuth callback error', err);
    res.status(500).send('Failed to complete Google auth');
  }
});

app.get('/api/calendar/events', async (req, res) => {
  try {
    const token = await getGoogleToken();
    const googleConfigured = Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && token
    );
    if (!googleConfigured) {
      return res.json({ events: getMockCalendarEvents() });
    }
    const calendar = google.calendar({ version: 'v3', auth: authClient });
    const now = new Date();
    const timeMin = req.query.start || now.toISOString();
    const timeMax =
      req.query.end ||
      new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const calendarIds = (process.env.GOOGLE_CALENDAR_IDS || 'primary')
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const cacheKey = `events:${timeMin}:${timeMax}:${calendarIds.join(',')}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const events = [];
    for (const calendarId of calendarIds) {
      const resp = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });
      events.push(
        ...resp.data.items.map((e) => ({
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
    const payload = { events };
    cache.set(cacheKey, payload, 120);
    res.json(payload);
  } catch (err) {
    console.error('Calendar error', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/weather', async (_req, res) => {
  try {
    const lat = process.env.WEATHER_LAT;
    const lon = process.env.WEATHER_LON;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!lat || !lon || !apiKey) {
      return res.json(getMockWeather());
    }
    const cacheKey = `weather:${lat}:${lon}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

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
    res.json(payload);
  } catch (err) {
    console.error('Weather error', err.response?.data || err.message);
    res.json(getMockWeather());
  }
});

app.get('/api/photos', async (_req, res) => {
  try {
    const dir = path.join(__dirname, 'photos');
    const files = await fs.readdir(dir);
    const images = files
      .filter((f) => /\.(jpe?g|png|gif|webp)$/i.test(f))
      .map((f) => `/photos/${f}`);
    res.json({ images });
  } catch (err) {
    console.error('Photos error', err);
    res.json({ images: [] });
  }
});

app.use('/photos', express.static(path.join(__dirname, 'photos')));

app.get('/api/mealie/mealplan', async (_req, res) => {
  try {
    const baseUrl = process.env.MEALIE_BASE_URL;
    const token = process.env.MEALIE_API_TOKEN;
    if (!baseUrl || !token) {
      return res.json(getEmptyMealPlan());
    }
    const resp = await axios.get(`${baseUrl}/api/meal-plans/current`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(resp.data);
  } catch (err) {
    console.error('Mealie meal plan error', err.response?.data || err.message);
    res.json(getEmptyMealPlan());
  }
});

app.get('/api/mealie/recipe/:id', async (req, res) => {
  try {
    const baseUrl = process.env.MEALIE_BASE_URL;
    const token = process.env.MEALIE_API_TOKEN;
    if (!baseUrl || !token) {
      return res.json(getEmptyRecipe());
    }
    const { id } = req.params;
    const resp = await axios.get(`${baseUrl}/api/recipes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(resp.data);
  } catch (err) {
    console.error('Mealie recipe error', err.response?.data || err.message);
    res.json(getEmptyRecipe());
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});

