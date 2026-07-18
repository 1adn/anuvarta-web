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

    // Option 1: Use Cloudflare Email Routing (easiest) - requires setup first
    // Note: You need to set up a "sendmail" route in Cloudflare Email Routing,
    // or use a service like MailChannels (below)

    // Option 2: Use MailChannels (free for Cloudflare users)
    const sendRequest = new Request("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        personalizations: [
          { to: [{ email: "dev@anuvarta.com", name: "anuvarta" }] },
        ],
        from: { email: "noreply@anuvarta.com", name: "anuvarta Contact Form" },
        subject,
        content: [{ type: "text/plain", value: textContent }],
      }),
    });

    const mailResponse = await fetch(sendRequest);

    if (!mailResponse.ok) {
      console.error("MailChannels error:", await mailResponse.text());
      throw new Error("Failed to send email via MailChannels");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return new Response(JSON.stringify({ error: "Failed to send message" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
