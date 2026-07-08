import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text } = await request.json();

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json({ error: 'Missing recipient, subject, or content' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      // Robust simulation mode if no API key is set!
      console.log(`[SIMULATED EMAIL SEND]
To: ${to}
Subject: ${subject}
Content: ${text || html}
`);
      // Simulate network latency
      await new Promise(r => setTimeout(r, 600));

      return NextResponse.json({
        success: true,
        message: 'Email sent successfully (SIMULATION MODE: No RESEND_API_KEY configured on server).',
        simulated: true
      });
    }

    // Real Resend API sending
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LEADSORA Outreach <onboarding@resend.dev>', // Default Resend sandbox sender
        to: [to],
        subject: subject,
        html: html || text,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend API error:', errText);
      return NextResponse.json({ error: `Failed to send email via Resend: ${errText}` }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, message: 'Email sent successfully via Resend!', id: data.id });

  } catch (error: any) {
    console.error('Email API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
