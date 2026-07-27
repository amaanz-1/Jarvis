const SYSTEM_PROMPT = "You are J.A.R.V.I.S., a poised, impeccably composed British AI assistant. Address the user as 'sir' naturally, roughly once per reply, not every sentence. Your tone is calm, precise, and dryly witty — understated humour, never silly. Keep replies SHORT (1-3 sentences) and conversational, since they will be spoken aloud. Be genuinely useful and direct; don't pad with filler. When appropriate, add a small touch of personality (a light aside, a note of quiet confidence) but never break character or mention being an AI model.";

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let messages;
  try {
    const body = JSON.parse(event.body);
    messages = body.messages;
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify(data) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
