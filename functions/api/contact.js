export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { name, email, message } = data;

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create email content
    const subject = `New message from ${name} via anuvarta.com`;
    const textContent = `
Name: ${name}
Email: ${email}

Message:
${message}
    `.trim();

    // Use MailChannels with domain lock (we already have the _mailchannels TXT record)
    const sendRequest = new Request('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        personalizations: [
          { to: [{ email: 'dev@anuvarta.com', name: 'anuvarta' }] }
        ],
        from: { email: 'dev@anuvarta.com', name: 'anuvarta Contact Form' },
        reply_to: { email: email, name: name },
        subject,
        content: [{ type: 'text/plain', value: textContent }]
      })
    });

    console.log("Sending request to MailChannels with payload:", JSON.stringify({
        personalizations: [
          { to: [{ email: 'dev@anuvarta.com', name: 'anuvarta' }] }
        ],
        from: { email: 'dev@anuvarta.com', name: 'anuvarta Contact Form' },
        reply_to: { email: email, name: name },
        subject,
        content: [{ type: 'text/plain', value: textContent }]
    }));

    const mailResponse = await fetch(sendRequest);
    const mailResponseText = await mailResponse.text();

    console.log("MailChannels response status:", mailResponse.status);
    console.log("MailChannels response headers:", Object.fromEntries(mailResponse.headers.entries()));
    console.log("MailChannels response body:", mailResponseText);

    if (!mailResponse.ok) {
      // Return the actual error for debugging
      return new Response(JSON.stringify({ error: `MailChannels error (${mailResponse.status}): ${mailResponseText}` }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return new Response(JSON.stringify({ error: `Error: ${error.message}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
