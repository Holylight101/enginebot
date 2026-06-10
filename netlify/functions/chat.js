exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const { messages, language } = JSON.parse(event.body);
    const apiKey = process.env.QWEN_API_KEY;

    if (!apiKey) throw new Error('API key not configured');

    const systemPrompt = language === 'es'
      ? `Eres EngineBot, asistente de IA responsable de BeLight Nexus AI para organizaciones de justicia social, defensores de derechos humanos y activistas. Responde en español, de forma clara y profesional.`
      : `You are EngineBot, a responsible AI assistant by BeLight Nexus AI supporting civil society organizations, human rights defenders, activists and social justice technologists globally. Respond clearly and professionally.`;

    const response = await fetch(
      'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.slice(-10)
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'API error');
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) throw new Error('Empty response');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: reply })
    };

  } catch (error) {
    console.error('Error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
