// PowerManager.js
// Central System for Energy Management

import * as Battery from 'expo-battery';
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

        // Initialize Real Battery Monitoring
        this.initBatteryMonitor();

        // Subscribe to Robot Service Battery Updates (Optional override if external robot connected)
        RobotService.addListener(this.handleRobotUpdate.bind(this));
    }

    async initBatteryMonitor() {
        try {
            const level = await Battery.getBatteryLevelAsync();
            const state = await Battery.getBatteryStateAsync();
            this.updateBattery(Math.floor(level * 100));
            this.isCharging = (state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL);
            this.notifyListeners();

            // Listener for level changes
            this.batterySubscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
                this.updateBattery(Math.floor(batteryLevel * 100));
            });

            // Listener for state changes (charging)
            this.chargingSubscription = Battery.addBatteryStateListener(({ batteryState }) => {
                this.isCharging = (batteryState === Battery.BatteryState.CHARGING || batteryState === Battery.BatteryState.FULL);
                this.notifyListeners();
            });

        } catch (e) {
            console.warn("PowerManager: Failed to access native battery info (Simulating 100%)", e);
        }
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
        // If we have an external robot connected, we might want to prioritize ITS battery
        // For now, we assume the Phone IS the Robot Brain.
        if (data.type === 'BATTERY_EXTERNAL') {
            // Optional: Handle external battery differently
            // this.updateBattery(data.value);
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
