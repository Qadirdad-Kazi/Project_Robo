// PowerManager.js
// Central System for Energy Management

import RobotService from '../services/RobotService';
import VoiceService from '../services/VoiceService';

export const POWER_MODES = {
    HIGH_PERF: 'HIGH_PERF',   // > 50%
    BALANCED: 'BALANCED',     // 20-50%
    POWER_SAVER: 'POWER_SAVER',// 10-20%
    CRITICAL: 'CRITICAL'      // < 10%
};

class PowerManager {
    constructor() {
        this.batteryLevel = 100;
        this.isCharging = false;
        this.mode = POWER_MODES.HIGH_PERF;
        this.listeners = [];

        // Subscribe to Robot Service Battery Updates
        RobotService.addListener(this.handleRobotUpdate.bind(this));
    }

    addListener(callback) {
        this.listeners.push(callback);
        callback(this.getStatus());
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    notifyListeners() {
        this.listeners.forEach(cb => cb(this.getStatus()));
    }

    getStatus() {
        return {
            level: this.batteryLevel,
            mode: this.mode,
            charging: this.isCharging
        };
    }

    handleRobotUpdate(data) {
        if (data.type === 'BATTERY') {
            this.updateBattery(data.value);
        }
    }

    updateBattery(level) {
        if (this.batteryLevel === level) return;

        this.batteryLevel = level;
        this.evaluateMode();
        this.notifyListeners();
    }

    evaluateMode() {
        const oldMode = this.mode;

        if (this.batteryLevel > 50) this.mode = POWER_MODES.HIGH_PERF;
        else if (this.batteryLevel > 20) this.mode = POWER_MODES.BALANCED;
        else if (this.batteryLevel > 10) this.mode = POWER_MODES.POWER_SAVER;
        else this.mode = POWER_MODES.CRITICAL;

        if (oldMode !== this.mode) {
            console.log(`[PowerManager] Mode changed: ${oldMode} -> ${this.mode}`);
            this.enforceModePolicy(this.mode);
        }
    }

    enforceModePolicy(mode) {
        // Broadcast Changes or Trigger Actions
        if (mode === POWER_MODES.POWER_SAVER) {
            VoiceService.speak("Battery low. Entering power saver mode.");
        } else if (mode === POWER_MODES.CRITICAL) {
            VoiceService.speak("Critical battery level. Shutting down non-essential systems.");
            // Trigger Critical Shutdown of Heavy AI?
        }
    }

    // --- POLICY API for Consumers ---

    /**
     * Get recommended polling interval for sensors (ms)
     */
    getSensorInterval(sensorType) {
        switch (this.mode) {
            case POWER_MODES.HIGH_PERF: return 100; // 10Hz
            case POWER_MODES.BALANCED: return 250;  // 4Hz
            case POWER_MODES.POWER_SAVER: return 1000;// 1Hz
            case POWER_MODES.CRITICAL: return 5000;   // 0.2Hz
            default: return 500;
        }
    }

    shouldAllowAI() {
        return this.mode !== POWER_MODES.CRITICAL;
    }

    shouldAllowMedia() {
        return this.mode !== POWER_MODES.CRITICAL;
    }
}

export default new PowerManager();
