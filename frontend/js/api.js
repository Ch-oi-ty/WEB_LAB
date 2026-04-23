const API = 'window.location.origin + '/api'';

async function apiFetch(endpoint, method='GET', body=null) {
  const token = localStorage.getItem('token');
  const res = await fetch(API + endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    },
    body: body ? JSON.stringify(body) : null
  });
  return res.json();
}
