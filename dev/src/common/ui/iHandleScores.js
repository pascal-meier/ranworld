// score.js
export const ScoreManager = {
    state: {
        s1: 0,
        s2: 0,
        s3: 0,
        s4: 0,
        s5: 0
    },

    add(key, amount = 1) {
        this.state[key] += amount;
    },

    get(key) {
        return this.state[key];
    },

    reset() {
        Object.keys(this.state).forEach(k => this.state[k] = 0);
    }
};
