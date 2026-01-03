"use server";

import { PexelsService } from "@/lib/api/pexels";

export async function searchStockVideos(query: string) {
    return await PexelsService.searchVideos(query);
}
