// Cloudflare Worker for contact form (save as functions/api/contact.js in your Pages project)
export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { name, email, message } = data;

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send email using MailChannels (Cloudflare's recommended email service)
    // You'll need to configure a domain in Cloudflare Email Routing or MailChannels
    const send_request = new Request('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: 'dev@anuvarta.com', name: 'anuvarta' }] }],
        from: { email: 'noreply@anuvarta.com', name: 'anuvarta contact form' },
        subject: `new message from ${name}`,
        content: [{
          type: 'text/plain',
          value: `from: ${name} (${email})\n\n${message}`,
        }],
      }),
    });

    await fetch(send_request);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to send message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
