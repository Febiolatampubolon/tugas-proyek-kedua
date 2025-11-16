import CONFIG from '../config';

const ENDPOINTS = {
  LIST: `${CONFIG.BASE_URL}/stories`,
  ADD: `${CONFIG.BASE_URL}/stories`,
  ADD_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
};

export async function getStories({ page = 1, size = 30, withLocation = true } = {}) {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('size', size);
  if (withLocation) params.set('location', 1);

  const response = await fetch(`${ENDPOINTS.LIST}?${params.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await response.json();
}

export async function addStory({ description, photo, lat, lon }) {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);
  formData.append('lat', lat);
  formData.append('lon', lon);

  const token = localStorage.getItem('token');
  const url = token ? ENDPOINTS.ADD : ENDPOINTS.ADD_GUEST;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  return await response.json();
}

export async function registerUser({ name, email, password }) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });
  
  return await response.json();
}

export async function loginUser({ email, password }) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  return await response.json();
}