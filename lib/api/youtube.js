import { google } from 'googleapis';

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/youtube';

export class YouTubeService {
    static oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
    );

    static getAuthUrl() {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/youtube.readonly',
                'https://www.googleapis.com/auth/youtube.upload'
            ]
        });
    }

    static async getToken(code) {
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);
        return tokens;
    }

    static async searchVideos(query, accessToken) {
        if (accessToken) {
            this.oauth2Client.setCredentials({ access_token: accessToken });
        }

        const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });

        try {
            // Step 1: Search for IDs (Search API doesn't give stats)
            const searchResponse = await youtube.search.list({
                part: ['snippet', 'id'],
                q: query,
                type: ['video'],
                order: 'viewCount', // Get potentially viral content first
                maxResults: 10
            });

            const videoIds = searchResponse.data.items?.map(item => item.id?.videoId).filter(Boolean);

            if (!videoIds || videoIds.length === 0) return [];

            // Step 2: Get Deep Stats (Videos API)
            const statsResponse = await youtube.videos.list({
                part: ['statistics', 'snippet', 'contentDetails'],
                id: videoIds
            });

            const videos = statsResponse.data.items || [];

            // Step 3: Get Channel Stats (Deep Research - Viral Signal Detector)
            // We need subscriber counts to calculate "Views-to-Subs" Ratio
            const channelIds = [...new Set(videos.map(v => v.snippet.channelId))];
            let channelMap = {};

            if (channelIds.length > 0) {
                try {
                    const channelResponse = await youtube.channels.list({
                        part: ['statistics'],
                        id: channelIds
                    });
                    channelResponse.data.items?.forEach(ch => {
                        channelMap[ch.id] = parseInt(ch.statistics.subscriberCount || 0);
                    });
                } catch (err) {
                    console.warn("Deep Research: Failed to fetch channel stats", err);
                }
            }

            // Map real API response to our rich structure
            return videos.map(item => {
                const now = new Date();
                const publishedAt = new Date(item.snippet.publishedAt);
                const hoursSincePublish = Math.max(0.1, (now - publishedAt) / (1000 * 60 * 60));

                const views = parseInt(item.statistics.viewCount || 0);
                const likes = parseInt(item.statistics.likeCount || 0);
                const comments = parseInt(item.statistics.commentCount || 0);

                // Deep Research Metrics
                const subscriberCount = channelMap[item.snippet.channelId] || 1; // avoid divide by zero
                const viralRatio = views / (subscriberCount === 0 ? 1 : subscriberCount); // >1.0 means more views than subs (VIRAL)

                return {
                    video_id: item.id,
                    title: item.snippet.title,
                    description: item.snippet.description,
                    channelTitle: item.snippet.channelTitle,
                    channelId: item.snippet.channelId,
                    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
                    published_at: item.snippet.publishedAt,
                    duration_iso: item.contentDetails.duration, // e.g. PT4M13S

                    // Core Metrics
                    views: views,
                    likes: likes,
                    comments: comments,
                    subscriber_count: subscriberCount,

                    // Calculated Velocity & Ratios (Module A + Deep Research)
                    view_velocity: views / hoursSincePublish,
                    like_ratio: views > 0 ? likes / views : 0,
                    comment_ratio: views > 0 ? comments / views : 0,
                    viral_ratio: viralRatio, // The "Monster Opportunity" signal

                    source: 'youtube_real'
                };
            }) || [];

        } catch (error) {
            console.error("YouTube API Error:", error);
            // Fallback for dev/demo if quota exceeded
            return [];
        }
    }
    static async getChannelStatistics(accessToken) {
        this.oauth2Client.setCredentials({ access_token: accessToken });
        const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });

        try {
            const response = await youtube.channels.list({
                part: ['statistics', 'snippet'],
                mine: true
            });

            const channel = response.data.items?.[0];
            if (!channel) return null;

            return {
                title: channel.snippet?.title || 'Unknown Channel',
                subscriberCount: channel.statistics?.subscriberCount || '0',
                viewCount: channel.statistics?.viewCount || '0',
                videoCount: channel.statistics?.videoCount || '0',
                thumbnail: channel.snippet?.thumbnails?.default?.url
            };
        } catch (e) {
            console.error("YouTube Channel Stats Failed", e);
            return null;
        }
    }
}
