import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';
import { scanAllSources } from '../../../utils/leadSources';

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

let redis: Redis | null = null;
if (redisUrl && redisToken) {
  redis = new Redis({ url: redisUrl, token: redisToken });
}

export async function GET(request: NextRequest) {
  try {
    if (!redis) {
      console.error('Redis is not configured. Ghost Mode aborted.');
      return NextResponse.json({ error: 'Redis is not configured' }, { status: 500 });
    }

    // Verify Vercel Cron Secret for security
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
      
      // Check if it's time to run (assuming UTC for now, or just running every hour for testing)
      const targetHour = parseInt(config.scanTime.split(':')[0] || '8');
      
      // For MVP, we will run if it matches the hour. (If you want to run every hour for testing, comment this out)
      if (currentUTCHour !== targetHour) {
        console.log(`Skipping ${email} - target hour ${targetHour} != current UTC hour ${currentUTCHour}`);
        continue;
      }

      console.log(`Running Ghost Scan for ${email}`);
      runCount++;

      // 1. Run the Scanner
      // scanAllSources expects (searchQuery, location, userPersona, scanMode, callback)
      const results = await scanAllSources(
        config.keywords || 'Software Engineer',
        'Global',
        'B2B Agency',
        config.scanMode || 'hiring',
        () => {} // No-op callback since we are in background
      );

      if (!results || results.length === 0) continue;

      // 2. Filter for whales & apply leadsPerDay limit
      const whales = results.filter((l: any) => l.intentScore >= 90).slice(0, config.leadsPerDay || 10);
      
      if (whales.length === 0) continue;

      // 3. Save leads back to DB
      const existingLeadsStr = await redis.get(`savedLeads_${email}`);
      const existingLeads = existingLeadsStr ? (typeof existingLeadsStr === 'string' ? JSON.parse(existingLeadsStr) : existingLeadsStr) : [];
      
      // Avoid duplicates
      const existingIds = new Set(existingLeads.map((l: any) => l.id));
      const newWhales = whales.filter((w: any) => !existingIds.has(w.id));

      if (newWhales.length > 0) {
        const updatedLeads = [...newWhales, ...existingLeads];
        await redis.set(`savedLeads_${email}`, JSON.stringify(updatedLeads));

        // 4. Fire Slack Notification for the top whale
        if (config.slackWebhook) {
          const topWhale = newWhales[0];
          try {
            await fetch(request.nextUrl.origin + '/api/slack-notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                webhookUrl: config.slackWebhook,
                type: 'new_lead',
                lead: topWhale
              })
            });
          } catch (e) {
            console.error('Failed to send Slack webhook', e);
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
