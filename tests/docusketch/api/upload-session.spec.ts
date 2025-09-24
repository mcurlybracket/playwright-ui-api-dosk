import { test, expect } from '@playwright/test';

test('Upload session → chunk → finalize → status done', async ({ request, baseURL }) => {
  const sess = await request.post('/api/projects/p1/uploads');
  expect(sess.status()).toBe(201);
  const { sessionId, chunkUrl } = await sess.json();
  expect(sessionId).toBeTruthy();

  const chunk = await request.put(chunkUrl, { data: Buffer.from('fakebytes') });
  expect(chunk.status()).toBe(200);

  const fin = await request.post('/api/projects/p1/finalize');
  expect(fin.status()).toBe(202);

  // poll until done
  for (let i = 0; i < 6; i++) {
    const r = await request.get('/api/projects/p1/status');
    const { status } = await r.json();
    if (status === 'done') return;
    await new Promise(r => setTimeout(r, 300));
  }
  throw new Error('processing not done');
});
