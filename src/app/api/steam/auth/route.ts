import { NextRequest, NextResponse } from "next/server";

// Redirect user to Steam OpenID login
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const returnUrl = `${origin}/api/steam/callback`;

  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnUrl,
    "openid.realm": origin,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });

  return NextResponse.redirect(`https://steamcommunity.com/openid/login?${params}`);
}
