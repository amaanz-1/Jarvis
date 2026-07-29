export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let audioBase64, mimeType;
  try {
    const body = JSON.parse(event.body);
    audioBase64 = body.audioBase64;
    mimeType = body.mimeType || 'audio/webm';
    if (!audioBase64) throw new Error('no audio provided');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  try {
    const buffer = Buffer.from(audioBase64, 'base64');
    const blob = new Blob([buffer], { type: mimeType });

    const form = new FormData();
    form.append('file', blob, 'audio.webm');
    form.append('model_id', 'scribe_v1');

    const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY },
      body: form
    });

    const data = await res.json();

    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify(data) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: data.text || '' })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
