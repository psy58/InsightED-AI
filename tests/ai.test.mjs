import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/ai.mjs';
const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
after(() => { globalThis.fetch = originalFetch; process.env = originalEnv; });
const request = (body, headers = {}, method = 'POST') => ({ method, body, headers: { 'content-type': 'application/json', 'x-ai-access-password': 'test-access', ...headers } });
async function run(req) {
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(n) { this.code = n; return this; }, json(value) { this.body = value; return this; } };
  await handler(req, res); return res;
}
const completed = text => ({ ok: true, json: async () => ({ status: 'completed', output: [{ content: [{ type: 'output_text', text }] }] }) });
test('server boundary and OpenAI flows', async t => {
  process.env.OPENAI_API_KEY = 'server-only-test-key';
  process.env.AI_ACCESS_PASSWORD = 'test-access';
  let calls = [];
  globalThis.fetch = async (url, options) => { calls.push({ url, options }); return completed('요약 결과'); };
  await t.test('reject missing password before any provider call', async () => {
    const res = await run(request({ action: 'summary', prompt: '예시' }, { 'x-ai-access-password': '' }));
    assert.equal(res.code, 401); assert.equal(calls.length, 0);
  });
  await t.test('reject unsupported actions and oversized input', async () => {
    assert.equal((await run(request({ action: 'anything' }))).code, 400);
    assert.equal((await run(request({ action: 'summary', prompt: 'a'.repeat(24001) }))).code, 400);
    assert.equal((await run(request({ action: 'summary', prompt: 'x' }, { 'content-length': '3500001' }))).code, 413);
    assert.equal(calls.length, 0);
  });
  await t.test('server selects model and caps tokens, ignores client overrides', async () => {
    process.env.OPENAI_MAX_OUTPUT_TOKENS = '999999';
    const res = await run(request({ action: 'report', prompt: '가상 학생 기록', model: 'untrusted', max_output_tokens: 999999 }));
    assert.equal(res.code, 200); assert.equal(res.body.result, '요약 결과');
    const sent = JSON.parse(calls.at(-1).options.body);
    assert.equal(sent.max_output_tokens, 4096); assert.equal(sent.model, 'gpt-4.1-mini'); assert.equal(sent.store, false);
    assert.ok(!JSON.stringify(res.body).includes('server-only-test-key'));
  });
  await t.test('incomplete output is not displayed as a complete report', async () => {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ status: 'incomplete', output: [] }) });
    assert.equal((await run(request({ action: 'summary', prompt: '가상 기록' }))).code, 502);
  });
  await t.test('image OCR uses schema and parses structured result', async () => {
    const expected = { extractedText: '가상 성찰', summary: '요약', keywords: ['성찰'] };
    globalThis.fetch = async (url, options) => {
      const sent = JSON.parse(options.body);
      assert.equal(sent.text.format.type, 'json_schema'); assert.equal(sent.text.format.strict, true);
      assert.equal(sent.input[0].content[1].type, 'input_image');
      return completed(JSON.stringify(expected));
    };
    assert.deepEqual((await run(request({ action: 'reflection', mimeType: 'image/png', data: 'aGVsbG8=' }))).body.result, expected);
  });
  await t.test('audio transcription then summary preserves existing return shape', async () => {
    const urls = [];
    globalThis.fetch = async (url, options) => {
      urls.push(url);
      if (url.endsWith('/audio/transcriptions')) {
        assert.ok(options.body instanceof FormData);
        return { ok: true, json: async () => ({ text: '가상 녹취' }) };
      }
      return completed('상담 요약');
    };
    const res = await run(request({ action: 'audio', mimeType: 'audio/webm;codecs=opus', data: 'aGVsbG8=' }));
    assert.equal(res.code, 200); assert.equal(urls.length, 2);
    assert.deepEqual(res.body.result, { transcription: '가상 녹취', summary: '상담 요약', visualDescription: '' });
  });
  await t.test('provider error body and secrets are never returned', async () => {
    globalThis.fetch = async () => ({ ok: false, status: 401, json: async () => ({ error: 'server-only-test-key' }) });
    const res = await run(request({ action: 'summary', prompt: '가상 기록' }));
    assert.equal(res.code, 502); assert.ok(!JSON.stringify(res.body).includes('server-only-test-key'));
  });
  await t.test('missing configuration returns a controlled error', async () => {
    delete process.env.OPENAI_API_KEY;
    assert.equal((await run(request({ action: 'summary', prompt: '가상 기록' }))).code, 503);
    assert.equal((await run(request({}, {}, 'GET'))).code, 405);
  });
});
