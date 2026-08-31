import { getStore } from '@netlify/blobs';

const ADMIN_PASSWORD = '1010';

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

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

  const store = getStore('phone-rental');
  const action = body.action;

  // 任何人都可以送出預約表單，不需要密碼
  if (action === 'create') {
    const { name, phone, lineid, device, startdate, days, region, idtype, note } = body;
    if (!name || !phone) {
      return new Response(JSON.stringify({ error: '缺少必要欄位' }), { status: 400 });
    }
    const list = (await store.get('submissions', { type: 'json' })) || [];
    list.unshift({
      id: genId(),
      receivedAt: new Date().toISOString(),
      name, phone, lineid, device, startdate, days, region, idtype, note
    });
    await store.setJSON('submissions', list);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 以下操作含個資，需要密碼
  if (action === 'list') {
    if (body.password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: '密碼錯誤' }), { status: 401 });
    }
    const list = (await store.get('submissions', { type: 'json' })) || [];
    return new Response(JSON.stringify({ submissions: list }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (action === 'delete') {
    if (body.password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: '密碼錯誤' }), { status: 401 });
    }
    const list = (await store.get('submissions', { type: 'json' })) || [];
    const filtered = list.filter(s => s.id !== body.id);
    await store.setJSON('submissions', filtered);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: '未知的操作' }), { status: 400 });
};

export const config = { path: '/.netlify/functions/submissions' };
