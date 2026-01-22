import { google } from 'googleapis';
import { Readable } from 'stream';

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
                order: 'viewCount', // Get potentially viral content first - filtering happens later
                maxResults: 50 // Increased to allow for velocity filtering
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
            const channelIds = [...new Set(videos.map(v => v.snippet.channelId))];
            let channelMap = {};

            if (channelIds.length > 0) {
                try {
                    // Batching channel requests (max 50 per call, likely safe here)
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

            // ISO 8601 Duration Parser Helper
            const parseDuration = (iso) => {
                if (!iso) return 0;
                const match = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
                if (!match) return 0;
                const hours = (parseInt(match[1]) || 0);
                const minutes = (parseInt(match[2]) || 0);
                const seconds = (parseInt(match[3]) || 0);
                return (hours * 3600) + (minutes * 60) + seconds;
            };

            const CREATOR_SIZE = {
                SMALL: 10000,
                MEDIUM: 100000,
                LARGE: 1000000
            };

            const getCreatorSize = (subs) => {
                if (subs < CREATOR_SIZE.SMALL) return "Small";
                if (subs < CREATOR_SIZE.MEDIUM) return "Medium";
                if (subs < CREATOR_SIZE.LARGE) return "Large";
                return "Mega";
            };

            // Map real API response to our rich structure
            const mappedVideos = videos.map(item => {
                const now = new Date();
                const publishedAt = new Date(item.snippet.publishedAt);
                const hoursSincePublish = Math.max(0.1, (now - publishedAt) / (1000 * 60 * 60));

                const views = parseInt(item.statistics.viewCount || 0);
                const likes = parseInt(item.statistics.likeCount || 0);
                const comments = parseInt(item.statistics.commentCount || 0);

                // Deep Research Metrics
                const subscriberCount = channelMap[item.snippet.channelId] || 1; // avoid divide by zero
                const viralRatio = views / (subscriberCount === 0 ? 1 : subscriberCount);
                const durationSec = parseDuration(item.contentDetails.duration);
                const viewVelocity = views / hoursSincePublish;

                return {
                    video_id: item.id,
                    title: item.snippet.title,
                    description: item.snippet.description, // Important for context
                    channelTitle: item.snippet.channelTitle,
                    channelId: item.snippet.channelId,
                    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
                    published_at: item.snippet.publishedAt,
                    duration_iso: item.contentDetails.duration,
                    duration_sec: durationSec,

                    // Core Metrics
                    views: views,
                    likes: likes,
                    comments: comments,
                    subscriber_count: subscriberCount,
                    creator_size: getCreatorSize(subscriberCount),

                    // Calculated Velocity & Ratios
                    view_velocity: parseFloat(viewVelocity.toFixed(2)),
                    like_ratio: views > 0 ? likes / views : 0,
                    comment_ratio: views > 0 ? comments / views : 0,
                    viral_ratio: parseFloat(viralRatio.toFixed(2)),

                    source: 'youtube_real'
                };
            }) || [];

            // Client-side Sort: Sort by View Velocity (User Request)
            // Note: API returned 'viewCount' sorted results, but we want 'Momentum'
            return mappedVideos.sort((a, b) => b.view_velocity - a.view_velocity);

        } catch (error) {
            console.error("YouTube API Error:", error);
            return [];
        }
    }

    static async searchRecruitChannels(query, accessToken) {
        if (!accessToken) return [];
        this.oauth2Client.setCredentials({ access_token: accessToken });
        const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });

        try {
            // 1. Find high-performing videos in this niche
            const searchResponse = await youtube.search.list({
                part: ['snippet'],
                q: query,
                type: ['video'],
                order: 'viewCount', // Vital: Get high views
                maxResults: 50,
                videoDuration: 'medium', // Avoid shorts for now if focused on main channel, or make configurable
                relevanceLanguage: 'en'
            });

            // 2. Extract unique channels
            const items = searchResponse.data.items || [];
            const channelIds = [...new Set(items.map(i => i.snippet.channelId))].slice(0, 15); // Check top 15 unique channels

            if (channelIds.length === 0) return [];

            // 3. Get Channel Stats to calculate "Viral Potential"
            const channelsResponse = await youtube.channels.list({
                part: ['statistics', 'snippet', 'contentDetails'],
                id: channelIds
            });

            const channels = channelsResponse.data.items || [];

            // 4. Rank by "Viral Effectiveness" (Views / Subs)
            // We want channels that get HIGH views despite potentially lower subs (high viral coefficient)
            const ranked = channels.map(ch => {
                const subs = parseInt(ch.statistics.subscriberCount) || 1;
                const totalViews = parseInt(ch.statistics.viewCount) || 0;
                const videoCount = parseInt(ch.statistics.videoCount) || 1;
                const avgViewsPerVideo = totalViews / videoCount;

                // Detailed score: How well do they perform relative to size?
                // A channel with 10k subs getting 100k views is better than 1M subs getting 100k views.
                const viralRatio = avgViewsPerVideo / subs;

                return {
                    id: ch.id,
                    title: ch.snippet.title,
                    description: ch.snippet.description,
                    thumbnail: ch.snippet.thumbnails?.medium?.url || ch.snippet.thumbnails?.default?.url,
                    stats: {
                        subscribers: subs,
                        totalViews: totalViews,
                        videoCount: videoCount,
                        avgViews: Math.round(avgViewsPerVideo)
                    },
                    viralRatio: viralRatio,
                    uploadsPlaylist: ch.contentDetails.relatedPlaylists?.uploads
                };
            })
                .sort((a, b) => b.viralRatio - a.viralRatio) // Best performing relative to size first
                .slice(0, 10);

            return ranked;

        } catch (e) {
            console.error("Recruit Search Failed", e);
            return [];
        }
    }

    static async getChannelDeepAnalytics(channelId, accessToken) {
        if (!accessToken) return null;
        this.oauth2Client.setCredentials({ access_token: accessToken });
        const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });

        try {
            // 1. Get Channel Details (if not passed) & Uploads Playlist ID
            const channelRes = await youtube.channels.list({
                part: ['statistics', 'snippet', 'contentDetails'],
                id: [channelId]
            });
            const channel = channelRes.data.items?.[0];
            if (!channel) return null;

            const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

            // 2. Fetch Recent Videos (Cheaper than Search API)
            const playlistRes = await youtube.playlistItems.list({
                part: ['snippet', 'contentDetails'],
                playlistId: uploadsPlaylistId,
                maxResults: 20 // Analyze last 20 videos
            });

            const recentVideos = playlistRes.data.items || [];
            const videoIds = recentVideos.map(v => v.contentDetails.videoId);

            // 3. Get Detailed Stats for these videos (Views, Likes, Tags)
            const videosRes = await youtube.videos.list({
                part: ['statistics', 'snippet', 'contentDetails'],
                id: videoIds
            });

            const videos = videosRes.data.items || [];

            // 4. ANALYZE DATA
            const subs = parseInt(channel.statistics.subscriberCount) || 1;

            // a). Performance over time (Graph Data)
            const graphData = videos.map(v => ({
                title: v.snippet.title,
                views: parseInt(v.statistics.viewCount || 0),
                likes: parseInt(v.statistics.likeCount || 0),
                publishedAt: v.snippet.publishedAt,
                subsBaseline: subs // For comparison line
            })).reverse(); // Oldest to newest for graph

            // b). Content DNA (Tags, Times)
            const allTags = videos.flatMap(v => v.snippet.tags || []);
            const tagCounts = allTags.reduce((acc, tag) => {
                acc[tag] = (acc[tag] || 0) + 1;
                return acc;
            }, {});
            const topTags = Object.entries(tagCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([tag, count]) => ({ tag, count }));

            // c). Upload Schedule
            const uploadTimes = videos.map(v => {
                const d = new Date(v.snippet.publishedAt);
                return {
                    day: d.toLocaleDateString('en-US', { weekday: 'long' }),
                    hour: d.getHours()
                };
            });
            // Simple mode calculation
            const dayCounts = {};
            const hourCounts = {};
            uploadTimes.forEach(t => {
                dayCounts[t.day] = (dayCounts[t.day] || 0) + 1;
                hourCounts[t.hour] = (hourCounts[t.hour] || 0) + 1;
            });
            const bestDay = Object.keys(dayCounts).sort((a, b) => dayCounts[b] - dayCounts[a])[0];
            const bestHour = Object.keys(hourCounts).sort((a, b) => hourCounts[b] - hourCounts[a])[0];

            return {
                channelDetails: {
                    title: channel.snippet.title,
                    thumbnail: channel.snippet.thumbnails.high.url,
                    subscribers: subs,
                    description: channel.snippet.description
                },
                analytics: {
                    graphData,
                    topTags,
                    bestUploadSchedule: { day: bestDay, hour: `${bestHour}:00` },
                    avgViewsLast20: Math.round(videos.reduce((sum, v) => sum + parseInt(v.statistics.viewCount || 0), 0) / videos.length)
                }
            };

        } catch (e) {
            console.error("Deep Analytics Failed", e);
            return null;
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

    static async getVideoComments(videoId) {
        if (!videoId) return [];
        const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
        try {
            const response = await youtube.commentThreads.list({
                part: ['snippet'],
                videoId: videoId,
                maxResults: 10,
                order: 'relevance'
            });
            return response.data.items?.map(item => item.snippet.topLevelComment.snippet.textDisplay) || [];
        } catch (e) {
            console.warn("Failed to fetch comments", e);
            return [];
        }
    }

    static async uploadVideo(videoFile, metadata, accessToken) {
        if (!accessToken) throw new Error("No access token provided for upload.");
        this.oauth2Client.setCredentials({ access_token: accessToken });
        const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });

        try {
            const res = await youtube.videos.insert({
                part: ['snippet', 'status'],
                notifySubscribers: false,
                requestBody: {
                    snippet: {
                        title: metadata.title,
                        description: metadata.description,
                        tags: metadata.tags || []
                    },
                    status: {
                        privacyStatus: 'private', // Must be private for scheduled uploads
                        publishAt: metadata.publishAt || undefined,
                        selfDeclaredMadeForKids: false
                    },
                },
                media: {
                    body: Readable.from(videoFile),
                },
            });

            return {
                id: res.data.id,
                status: "uploaded",
                videoUrl: `https://youtu.be/${res.data.id}`,
                privacy: res.data.status.privacyStatus
            };

        } catch (e) {
            console.error("YouTube Upload Failed", e);
            throw e;
        }
    }
}
