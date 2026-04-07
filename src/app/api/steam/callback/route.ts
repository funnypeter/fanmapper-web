import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const claimedId = params.get("openid.claimed_id");

  if (!claimedId) {
    return NextResponse.redirect(new URL("/profile/link-steam?error=no_id", request.url));
  }

  // Extract Steam ID from claimed_id URL
  // Format: https://steamcommunity.com/openid/id/76561198011775992
  const steamId = claimedId.split("/").pop();

  if (!steamId || steamId.length !== 17) {
    return NextResponse.redirect(new URL("/profile/link-steam?error=invalid_id", request.url));
  }

  // Verify with Steam (check_authentication)
  const verifyParams = new URLSearchParams();
  params.forEach((value, key) => verifyParams.set(key, value));
  verifyParams.set("openid.mode", "check_authentication");

  try {
    const verifyRes = await fetch("https://steamcommunity.com/openid/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verifyParams.toString(),
    });

    const verifyText = await verifyRes.text();

    if (!verifyText.includes("is_valid:true")) {
      return NextResponse.redirect(new URL("/profile/link-steam?error=verification_failed", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/profile/link-steam?error=verification_failed", request.url));
  }

  // Redirect to link-steam page with the verified Steam ID
  return NextResponse.redirect(new URL(`/profile/link-steam?steamid=${steamId}`, request.url));
}
