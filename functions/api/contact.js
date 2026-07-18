export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { name, email, message } = data;

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sendRequest = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        personalizations: [
          { to: [{ email: 'dev@anuvarta.com', name: 'anuvarta' }] }
        ],
        from: { email: 'noreply@anuvarta.com', name: 'anuvarta Contact Form' },
        subject: `New message from ${name}`,
        content: [{
          type: 'text/plain',
          value: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        }]
      })
    });

    const respText = await sendRequest.text();
    if (!sendRequest.ok) {
      return new Response(JSON.stringify({ error: `MailChannels error: ${respText}` }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: `Error: ${err.message}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
