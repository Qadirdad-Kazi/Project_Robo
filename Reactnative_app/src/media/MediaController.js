// MediaController.js
import YouTubeService from './YouTubeService';
import VoiceService from '../services/VoiceService';

class MediaController {
    constructor() {
        this.status = 'IDLE'; // IDLE, PLAYING, PAUSED
        this.currentTrack = null;
        this.listeners = [];
    }

    addListener(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    notifyListeners() {
        this.listeners.forEach(cb => cb(this.getStatus()));
    }

    getStatus() {
        return {
            status: this.status,
            track: this.currentTrack
        };
    }

    async play(query) {
        console.log(`[MediaController] Requesting: ${query}`);

        this.status = 'PLAYING';
        this.currentTrack = query;
        this.notifyListeners();

        VoiceService.speak(`Opening YouTube for ${query}`);

        const success = await YouTubeService.searchAndPlay(query);
        if (!success) {
            this.status = 'ERROR';
            VoiceService.speak("Could not open player.");
            this.notifyListeners();
        }
    }

    pause() {
        if (this.status !== 'PLAYING') return;

        console.log("[MediaController] Pause requested");
        // Note: Cannot pause external app via Linking.
        // We update internal state and give feedback.
        this.status = 'PAUSED';
        this.notifyListeners();
        VoiceService.speak("Pausing media session.");
    }

    stop() {
        console.log("[MediaController] Stop requested");
        this.status = 'IDLE';
        this.currentTrack = null;
        this.notifyListeners();
        VoiceService.speak("Media stopped.");
    }

    next() {
        console.log("[MediaController] Next requested");
        // Cannot control external queue.
        VoiceService.speak("Skipping track is not supported in external mode.");
    }
}

export default new MediaController();
