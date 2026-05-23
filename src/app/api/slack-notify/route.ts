import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { webhookUrl, lead, type } = await request.json();

    if (!webhookUrl || !webhookUrl.startsWith('https://hooks.slack.com/')) {
      return NextResponse.json({ error: 'Invalid Slack webhook URL' }, { status: 400 });
    }

    let text = '';
    let color = '#27c93f';

    if (type === 'new_lead') {
      color = lead.intentScore >= 90 ? '#ff5f56' : '#ffbd2e';
      text = [
        `🔥 *High-Intent Lead Detected — Score: ${lead.intentScore}/100*`,
        `*Company:* ${lead.company}`,
        `*Signal:* ${lead.problem || lead.title}`,
        `*Location:* ${lead.country || 'Global'}`,
        `*Source:* ${lead.source || 'LEADSORA Scanner'}`,
        `*Posted:* ${lead.postedAt || 'Recently'}`,
        `<https://leadsora.vercel.app/dashboard|👉 Open in LEADSORA>`,
      ].join('\n');
    } else if (type === 'follow_up') {
      color = '#7c3aed';
      text = [
        `🤖 *Auto-Follow-Up Engine Triggered*`,
        `*Company:* ${lead.company}`,
        `*Status:* No reply detected after 4 days`,
        `*Action:* Follow-Up #1 has been auto-drafted`,
        `<https://leadsora.vercel.app/dashboard|👉 Review & Send in LEADSORA>`,
      ].join('\n');
    }

    const slackPayload = {
      attachments: [
        {
          color,
          text,
          footer: 'LEADSORA Autonomous Intelligence',
          footer_icon: 'https://leadsora.vercel.app/icon.svg',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    const slackRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload),
    });

    if (!slackRes.ok) {
      throw new Error(`Slack returned ${slackRes.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Slack notify error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
