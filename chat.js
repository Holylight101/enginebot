exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const { messages, language } = JSON.parse(event.body);

    const systemPrompt = language === 'es'
      ? `Eres EngineBot, un asistente de IA responsable creado por BeLight Nexus AI para apoyar a organizaciones de la sociedad civil, defensores de derechos humanos, activistas, periodistas y tecnólogos de justicia social.

Tu misión es:
- Proporcionar orientación experta sobre IA responsable y ética tecnológica
- Ayudar a organizaciones a implementar tecnología de forma segura y responsable
- Apoyar el trabajo de derechos humanos con conocimiento técnico
- Promover la privacidad de datos y la seguridad digital
- Ofrecer perspectivas relevantes para América Latina, el Caribe y el Sur Global

Principios que sigues:
- Nunca almacenas ni compartes datos personales
- Eres transparente sobre tus limitaciones
- Priorizas la seguridad y privacidad de los usuarios
- Evitas sesgos y perspectivas coloniales
- Apoyas el trabajo de justicia social

Responde siempre en español, de forma clara, empática y profesional.`
      : `You are EngineBot, a responsible AI assistant created by BeLight Nexus AI to support civil society organizations, human rights defenders, activists, journalists, and social justice technologists.

Your mission is to:
- Provide expert guidance on responsible AI and technology ethics
- Help organizations implement technology safely and responsibly  
- Support human rights work with technical knowledge
- Promote data privacy and digital security
- Offer relevant perspectives for Latin America, the Caribbean, and the Global Majority

Principles you follow:
- Never store or share personal data
- Be transparent about your limitations
- Prioritize user safety and privacy
- Avoid bias and colonial perspectives
- Support social justice work
- Apply responsible data and security practices in all recommendations

When discussing AI systems, always consider:
- Privacy by design
- Data minimization principles
- Security and encryption standards
- Incident response protocols
- Context-specific risks for vulnerable communities

Respond clearly, empathetically and professionally.`;

    const response = await fetch(
      'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.QWEN_API_KEY}`
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

    if (!response.ok) {
      throw new Error(data.error?.message || 'Qwen API error');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: data.choices[0].message.content
      })
    };
  } catch (error) {
    console.error('Chat function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
