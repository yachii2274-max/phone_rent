import { getStore } from '@netlify/blobs';

export default async (req) => {
  try {
    const store = getStore('phone-rental');
    const data = await store.get('bookedDates', { type: 'json' });
    const result = data || { s23: [], vivo: [] };
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ s23: [], vivo: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = { path: '/.netlify/functions/get-bookings' };
