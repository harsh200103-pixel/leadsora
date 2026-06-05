import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

let redis: Redis | null = null;
if (redisUrl && redisToken) {
  redis = new Redis({ url: redisUrl, token: redisToken });
}

export async function GET(request: NextRequest) {
  try {
    if (!redis) {
      return NextResponse.json({ error: 'Redis is not configured' }, { status: 500 });
    }

    // Security check
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUTCHour = new Date().getUTCHours();
    const activeUsers = await redis.smembers('active_ghost_users');
    let runCount = 0;

    for (const email of activeUsers) {
      const configStr = await redis.get(`ghostConfig_${email}`);
      if (!configStr) continue;

      const config = typeof configStr === 'string' ? JSON.parse(configStr) : configStr;

      // Check if it's the right hour to scan
      const targetHour = parseInt((config.scanTime || '08:00').split(':')[0]);
      if (currentUTCHour !== targetHour) continue;

      console.log(`Running Ghost Scan for ${email}`);
      runCount++;

      // Call existing /api/leads endpoint (server-compatible, no browser deps)
      const baseUrl = request.nextUrl.origin;
      const scanRes = await fetch(`${baseUrl}/api/leads?search=${encodeURIComponent(config.keywords || 'Software Engineer')}`);
      if (!scanRes.ok) continue;

      const results = await scanRes.json();
      const leads: any[] = Array.isArray(results) ? results : [];

      // Filter whales with high intent score
      const whales = leads.filter((l: any) => (l.intentScore || 0) >= 90).slice(0, config.leadsPerDay || 10);
      if (whales.length === 0) continue;

      // Deduplicate
      const existingStr = await redis.get(`savedLeads_${email}`);
      const existing: any[] = existingStr
        ? typeof existingStr === 'string' ? JSON.parse(existingStr) : existingStr
        : [];
      const existingIds = new Set(existing.map((l: any) => l.id));
      const newWhales = whales.filter((w: any) => !existingIds.has(w.id));

      if (newWhales.length > 0) {
        await redis.set(`savedLeads_${email}`, JSON.stringify([...newWhales, ...existing]));

        // Fire Slack notification for top whale
        if (config.slackWebhook) {
          try {
            await fetch(`${baseUrl}/api/slack-notify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ webhookUrl: config.slackWebhook, type: 'new_lead', lead: newWhales[0] }),
            });
          } catch (e) {
            console.error('Slack notify failed', e);
          }
        }
      }
    }

    return NextResponse.json({ success: true, processedUsers: runCount });
  } catch (error: any) {
    console.error('Ghost Mode Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
