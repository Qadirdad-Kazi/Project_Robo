// VisionDebugService.js
// Singleton to stream vision debug data to the UI

class VisionDebugService {
    constructor() {
        this.data = {
            fps: 0,
            faceDetected: false,
            faceCount: 0,
            confidence: 0,
            identity: 'NONE',
            lastGreeting: 'None',
            lastGreetingTime: 0,
            emotion: 'NEUTRAL' // New
        };
        this.listeners = [];
    }

    update(newData) {
        this.data = { ...this.data, ...newData };
        this.notify();
    }

    updateEmotion(emotion) {
        this.data.emotion = emotion;
        this.notify();
    }

    updateGreeting(msg) {
        this.data.lastGreeting = msg;
        this.data.lastGreetingTime = Date.now();
        this.notify();
    }

    addListener(callback) {
        this.listeners.push(callback);
        callback(this.data);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    notify() {
        this.listeners.forEach(cb => cb(this.data));
    }
}

export default new VisionDebugService();
