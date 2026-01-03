import { createClient } from 'pexels';

const CLIENT_KEY = process.env.PEXELS_API_KEY || 'no-key';
const client = CLIENT_KEY !== 'no-key' ? createClient(CLIENT_KEY) : null;

export class PexelsService {

    static async searchVideos(query: string) {
        if (!client) {
            console.warn("Pexels Key Missing");
            return [];
        }

        try {
            const result = await client.videos.search({ query, per_page: 5, orientation: 'portrait' });
            // Type assertion or check 'videos' property
            if ('videos' in result) {
                return result.videos.map(v => ({
                    id: v.id,
                    url: v.video_files.find(f => f.height > 720 && f.height < 1440)?.link || v.video_files[0].link,
                    image: v.image,
                    duration: v.duration
                }));
            }
            return [];
        } catch (e) {
            console.error("Pexels Search Failed", e);
            return [];
        }
    }
}
