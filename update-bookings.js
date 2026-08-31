import { getStore } from '@netlify/blobs';

const ADMIN_PASSWORD = '1010';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: '格式錯誤' }), { status: 400 });
  }

  const { password, bookedDates } = body || {};

  if (password !== ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: '密碼錯誤' }), { status: 401 });
  }

  if (!bookedDates || !Array.isArray(bookedDates.s23) || !Array.isArray(bookedDates.vivo)) {
    return new Response(JSON.stringify({ error: '資料格式錯誤' }), { status: 400 });
  }

  const store = getStore('phone-rental');
  await store.setJSON('bookedDates', bookedDates);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const config = { path: '/.netlify/functions/update-bookings' };
