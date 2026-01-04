import { NextResponse } from "next/server";
import { YouTubeService } from "@/lib/api/youtube";

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    try {
        const tokens = await YouTubeService.getToken(code);

        // Redirect back to dashboard
        const res = NextResponse.redirect(new URL("/dashboard", req.url));

        // Store token in cookie for the session
        // In production, use encrypted session storage
        if (tokens.access_token) {
            res.cookies.set("yt_access_token", tokens.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 3600, // 1 hour
                path: "/" // Critical: Ensure cookie is available on all routes
            });
            console.log("Cookie Set: yt_access_token set with path /");
        } else {
            console.error("Token Exchange: No access_token received in response", tokens);
        }

        return res;
    } catch (error) {
        console.error("Token Exchange Error", error);
        return NextResponse.redirect(new URL("/dashboard?error=auth_failed", req.url));
    }
}
