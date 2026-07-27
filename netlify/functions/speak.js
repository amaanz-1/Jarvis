export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let text;
  try {
    const body = JSON.parse(event.body);
    text = body.text;
    if (!text) throw new Error('no text provided');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.8,
          style: 0.35,
          use_speaker_boost: true
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return { statusCode: res.status, body: errText };
    }

    const arrayBuffer = await res.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'audio/mpeg' },
      body: base64Audio,
      isBase64Encoded: true
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
