import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const clientId = body.clientId || process.env.MAPPLS_CLIENT_ID || 'pxmvthgexkyugaoxguodksxaxupzeqwtyedq';
    const clientSecret = body.clientSecret || process.env.MAPPLS_CLIENT_SECRET;

    if (!clientSecret) {
      return NextResponse.json({
        error: 'CLIENT_SECRET_REQUIRED',
        message: 'MapmyIndia requires both Client ID and Client Secret to generate an access token.',
        clientId,
      }, { status: 400 });
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    const tokenRes = await fetch('https://outpost.mappls.com/api/security/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params.toString(),
    });

    const data = await tokenRes.json();
    return NextResponse.json(data, { status: tokenRes.status });
  } catch (error: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 });
  }
}
