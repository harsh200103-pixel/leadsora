import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

let redis: Redis | null = null;
if (redisUrl && redisToken) {
  redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });
}

// Fetch user data
export async function GET(request: NextRequest) {
  try {
    if (!redis) {
      return NextResponse.json({
        warning: 'Redis is not configured in Vercel environment variables. Settings will be kept locally.',
        ghostConfig: null,
        savedLeads: [],
        aiOutreach: {},
        companyReports: {}
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    const [ghostConfig, savedLeads, aiOutreach, companyReports] = await Promise.all([
      redis.get(`ghostConfig_${email}`),
      redis.get(`savedLeads_${email}`),
      redis.get(`aiOutreach_${email}`),
      redis.get(`companyReports_${email}`)
    ]);

    return NextResponse.json({
      ghostConfig: ghostConfig || null,
      savedLeads: savedLeads || [],
      aiOutreach: aiOutreach || {},
      companyReports: companyReports || {}
    });

  } catch (error: any) {
    console.error('Redis GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update user data
export async function POST(request: NextRequest) {
  try {
    if (!redis) {
      return NextResponse.json({
        success: false,
        warning: 'Redis is not configured in Vercel environment variables. Saved locally only.'
      });
    }

    const body = await request.json();
    const { email, ghostConfig, savedLeads, aiOutreach, companyReports } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required to save data' }, { status: 400 });
    }

    // Use a pipeline to save everything simultaneously
    const pipeline = redis.pipeline();
    
    if (ghostConfig !== undefined) {
      pipeline.set(`ghostConfig_${email}`, JSON.stringify(ghostConfig));
      if (ghostConfig.enabled) {
        pipeline.sadd('active_ghost_users', email);
      } else {
        pipeline.srem('active_ghost_users', email);
      }
    }
    if (savedLeads !== undefined) pipeline.set(`savedLeads_${email}`, JSON.stringify(savedLeads));
    if (aiOutreach !== undefined) pipeline.set(`aiOutreach_${email}`, JSON.stringify(aiOutreach));
    if (companyReports !== undefined) pipeline.set(`companyReports_${email}`, JSON.stringify(companyReports));

    await pipeline.exec();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Redis POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
