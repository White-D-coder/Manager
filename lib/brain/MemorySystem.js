const DEFAULT_MEMORY = {
    total_cycles: 0,
    successful_topics: [],
    blacklisted_topics: [],
    hook_weights: {
        "negative_frame": 1.0,
        "curiosity": 1.0,
        "direct_value": 1.0
    },
    ctr_baseline: 0.05
};

export class MemorySystem {
    static KEY = 'growth_machine_memory_v1';

    static load() {
        if (typeof window === 'undefined') return DEFAULT_MEMORY;

        const saved = localStorage.getItem(this.KEY);
        return saved ? JSON.parse(saved) : DEFAULT_MEMORY;
    }

    static save(mem) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(this.KEY, JSON.stringify(mem));
    }

    static recordSuccess(topic, ctr) {
        const mem = this.load();
        mem.total_cycles += 1;
        mem.successful_topics.push(topic);

        // Simple learning rule: If CTR > baseline, increase baseline slightly
        if (ctr > mem.ctr_baseline) {
            mem.ctr_baseline = (mem.ctr_baseline * 0.9) + (ctr * 0.1);
        }

        this.save(mem);
        return mem;
    }
}
