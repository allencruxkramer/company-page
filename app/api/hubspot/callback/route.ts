import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({ error, description: searchParams.get('error_description') }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code received' }, { status: 400 });
  }

  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
  const redirectUri = `${process.env.APP_URL}/api/hubspot/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'HubSpot client credentials not configured in env vars' }, { status: 500 });
  }

  const res = await fetch('https://api.hubapi.com/oauth/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: 'Token exchange failed', details: data }, { status: 500 });
  }

  // Return tokens as JSON — copy the refresh_token and add to Vercel env vars
  return NextResponse.json({
    message: 'HubSpot connected. Copy the refresh_token below and send it to Claude to store in Vercel.',
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  });
}
