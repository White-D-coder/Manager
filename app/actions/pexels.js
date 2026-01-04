"use server";

import { PexelsService } from "@/lib/api/pexels";

export async function searchStockVideos(query) {
    return await PexelsService.searchVideos(query);
}
