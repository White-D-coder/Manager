export class MemorySystem {
    // Singleton State (In-Memory for now, would be DB in production)
    static state = {
        uploads: [],
        trends_history: [],
        learnings: [],
        last_run: null,
        fatigue_tracker: {
            hooks: {},
            emotions: {}
        }
    };

    /**
     * Records a successful upload to memory.
     * Used for Fatigue Analysis and Performance Tracking.
     */
    static recordUpload(video) {
        const entry = {
            id: video.id,
            title: video.title,
            timestamp: new Date().toISOString(),
            script_meta: video.meta, // Contains hook_type, emotion, etc.
            performance: null // To be filled later
        };

        this.state.uploads.push(entry);
        this.updateFatigueTracker(entry);

        console.log("MemorySystem: Upload recorded.", entry.title);
        return true;
    }

    static updateFatigueTracker(entry) {
        // Track Hooks
        const hook = entry.script_meta?.hook_type || 'unknown';
        this.state.fatigue_tracker.hooks[hook] = (this.state.fatigue_tracker.hooks[hook] || 0) + 1;

        // Track Emotions
        const emotion = entry.script_meta?.emotion || 'unknown';
        this.state.fatigue_tracker.emotions[emotion] = (this.state.fatigue_tracker.emotions[emotion] || 0) + 1;
    }

    /**
     * Checks if a specific creative angle is overused in the last 7 items.
     * Returns true if fatigued.
     */
    static checkFatigue(attributeType, value) {
        // Simple check: if used > 3 times in last 7 uploads
        const recent = this.state.uploads.slice(-7);
        const count = recent.filter(u => u.script_meta?.[attributeType] === value).length;

        const isFatigued = count >= 3;
        if (isFatigued) {
            console.warn(`MemorySystem: FATIGUE DETECTED for ${attributeType} = ${value}`);
        }
        return isFatigued;
    }

    /**
     * Retrieves the "Best" performing strategies from history.
     */
    static getBestStrategies() {
        // Filter uploads with known high performance
        // Mock logic for now
        return this.state.learnings.filter(l => l.rating === 'high');
    }

    static saveState() {
        // In a real app, write to JSON file or DB
        // fs.writeFileSync('brain_memory.json', JSON.stringify(this.state));
    }
}
