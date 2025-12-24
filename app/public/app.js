const views = ['calendar', 'weather', 'photos', 'cook'];
const idleMs = Number(window.SCREENSAVER_IDLE_MS || 300000);
let idleTimer;
let slideshowImages = [];
let slideshowIndex = 0;

function setView(target) {
  views.forEach((view) => {
    document.querySelector(`#view-${view}`).classList.toggle('active', view === target);
    document.querySelector(`[data-view="${view}"]`).classList.toggle('active', view === target);
  });
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

async function loadWeather() {
  const res = await fetch('/api/weather');
  const container = document.getElementById('weather-panel');
  if (!res.ok) {
    container.innerHTML = '<div class="weather-card">Weather unavailable</div>';
    document.getElementById('current-weather').textContent = 'Weather unavailable';
    return;
  }
  const data = await res.json();
  const current = data.current;
  const daily = data.daily?.slice(0, 4) || [];
  if (!current) {
    container.innerHTML = '<div class="weather-card">Weather unavailable</div>';
    document.getElementById('current-weather').textContent = 'Weather unavailable';
    return;
  }
  container.innerHTML = `
    <div class="weather-card">
      <div>Now</div>
      <div style="font-size:32px;font-weight:700">${Math.round(current.temp)}°</div>
      <div>${current.weather?.[0]?.description || ''}</div>
    </div>
    ${daily
      .map(
        (d) => `
      <div class="weather-card">
        <div>${new Date(d.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' })}</div>
        <div>${Math.round(d.temp.min)}° / ${Math.round(d.temp.max)}°</div>
        <div>${d.weather?.[0]?.main || ''}</div>
      </div>`
      )
      .join('')}
  `;
  document.getElementById(
    'current-weather'
  ).textContent = `${Math.round(current.temp)}° ${current.weather?.[0]?.main || ''}`;
}

async function loadCalendar() {
  const res = await fetch('/api/calendar/events');
  const grid = document.getElementById('calendar-grid');
  if (!res.ok) {
    grid.innerHTML = '<div class="day-card">Calendar unavailable</div>';
    return;
  }
  const { events = [] } = await res.json();
  const days = {};
  events.forEach((e) => {
    const key = e.start?.slice(0, 10);
    if (!days[key]) days[key] = [];
    days[key].push(e);
  });
  const sortedKeys = Object.keys(days).sort();
  grid.innerHTML = sortedKeys
    .map((day) => {
      const date = new Date(day);
      return `
      <div class="day-card">
        <div class="day-header">
          <div class="day-name">${date.toLocaleDateString(undefined, { weekday: 'short' })}</div>
          <div class="day-date">${date.getDate()}</div>
        </div>
        ${days[day]
          .map(
            (ev) => `
          <div class="event">
            <div class="event-title">${ev.summary || 'Busy'}</div>
            <div class="event-time">${formatTime(new Date(ev.start))} – ${formatTime(
              new Date(ev.end)
            )}</div>
          </div>`
          )
          .join('')}
      </div>`;
    })
    .join('');
  if (!sortedKeys.length) {
    grid.innerHTML = '<div class="day-card">No events</div>';
  }
}

async function loadPhotos() {
  const res = await fetch('/api/photos');
  const grid = document.getElementById('photos-grid');
  if (!res.ok) {
    grid.innerHTML = '<div class="photo">Photos unavailable</div>';
    slideshowImages = [];
    return;
  }
  const { images = [] } = await res.json();
  slideshowImages = images;
  grid.innerHTML = images
    .map((src) => `<div class="photo"><img src="${src}" loading="lazy" /></div>`)
    .join('');
  if (!images.length) {
    grid.innerHTML = '<div class="photo">No photos yet</div>';
  }
}

async function loadMealPlan() {
  const res = await fetch('/api/mealie/mealplan');
  const container = document.getElementById('meal-plan');
  if (!res.ok) {
    container.innerHTML = '<div class="meal-card">Meal plan unavailable</div>';
    return;
  }
  const data = await res.json();
  const meals = data?.mealPlan?.meals || [];
  container.innerHTML = meals
    .map(
      (m) => `
    <div class="meal-card" data-id="${m.recipeId}">
      <div>${m.name || 'Meal'}</div>
      <div style="color:var(--muted)">${m.date || ''}</div>
    </div>`
    )
    .join('');
  container.querySelectorAll('.meal-card').forEach((card) => {
    card.addEventListener('click', () => loadRecipe(card.dataset.id));
  });
  if (!meals.length) {
    container.innerHTML = '<div class="meal-card">No meals planned</div>';
  }
}

async function loadRecipe(id) {
  const res = await fetch(`/api/mealie/recipe/${id}`);
  const detail = document.getElementById('recipe-detail');
  if (!res.ok) {
    detail.innerHTML = '<div>Recipe unavailable</div>';
    return;
  }
  const data = await res.json();
  detail.innerHTML = `
    <div style="font-size:18px;font-weight:700">${data.name}</div>
    <div style="margin:8px 0;color:var(--muted)">${data.description || ''}</div>
    <ol>
      ${data.steps
        ?.map((s) => `<li>${s.description}</li>`)
        .join('') || '<li>No steps</li>'}
    </ol>
  `;
}

function startScreensaver() {
  if (!slideshowImages.length) return;
  const overlay = document.getElementById('screensaver');
  overlay.classList.remove('hidden');
  changeSlide();
}

function stopScreensaver() {
  const overlay = document.getElementById('screensaver');
  overlay.classList.add('hidden');
}

function changeSlide() {
  if (!slideshowImages.length) return;
  const img = document.getElementById('screensaver-image');
  img.src = slideshowImages[slideshowIndex % slideshowImages.length];
  slideshowIndex += 1;
  setTimeout(() => {
    if (!document.getElementById('screensaver').classList.contains('hidden')) {
      changeSlide();
    }
  }, 7000);
}

function resetIdleTimer() {
  clearTimeout(idleTimer);
  stopScreensaver();
  idleTimer = setTimeout(startScreensaver, idleMs);
}

function bindNav() {
  document.querySelectorAll('.nav').forEach((btn) => {
    btn.addEventListener('click', () => {
      setView(btn.dataset.view);
      resetIdleTimer();
    });
  });
}

function initMeta() {
  const now = new Date();
  document.getElementById('current-date').textContent = formatDate(now);
}

async function init() {
  bindNav();
  initMeta();
  await loadCalendar();
  await loadWeather();
  await loadPhotos();
  await loadMealPlan();
  resetIdleTimer();
  ['click', 'touchstart', 'mousemove', 'keydown'].forEach((evt) =>
    document.addEventListener(evt, resetIdleTimer)
  );
}

init();

