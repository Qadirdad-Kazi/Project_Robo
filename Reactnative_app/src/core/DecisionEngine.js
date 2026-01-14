// DecisionEngine.js
// The Core Brain of the Robot.
// Arbitrates between Inputs (Sensors, Vision, User) to decide Movement.

import RobotService from '../services/RobotService';
import VoiceService from '../services/VoiceService';
import SafetyMonitor from '../safety/SafetyRules';

export const MODES = {
    IDLE: 'IDLE',
    MANUAL: 'MANUAL',
    FOLLOW: 'FOLLOW',
    GOTO: 'GOTO',
    AVOID: 'AVOID',
    DANCE: 'DANCE',
    SAFETY_LOCK: 'SAFETY_LOCK' // New Mode for sensor fail
};

class DecisionEngine {
    constructor() {
        this.currentMode = MODES.IDLE;

        // Input States
        this.sensorState = { distance: 200, blocked: false };
        this.visionProposal = null;

        // Listeners for UI
        this.listeners = [];

        // Settings
        this.safetyEnabled = true;

        // Loop
        this.decisionLoop = setInterval(this.evaluate.bind(this), 250);
    }

    // --- OBSERVABILITY ---
    addListener(callback) {
        this.listeners.push(callback);
        const state = this.captureState('INIT', 'System Start');
        callback(state);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    notifyListeners(data) {
        this.listeners.forEach(cb => cb(data));
    }

    captureState(decision, reason) {
        return {
            type: 'THINK',
            mode: this.currentMode,
            decision: decision,
            reason: reason,
            safety: this.sensorState,
            proposal: this.visionProposal
        };
    }

    // --- INPUTS ---

    /**
     * Update Sensor Data (Safety Layer)
     * @param {number} distance in cm
     */
    updateSafetyStatus(distance) {
        this.sensorState.distance = distance;
        this.sensorState.blocked = distance < 30;
        SafetyMonitor.notifySensorHeartbeat(); // Keep Alive
    }

    setMode(mode) {
        if (this.currentMode === mode) return;

        console.log(`[DecisionEngine] Mode Change: ${this.currentMode} -> ${mode}`);
        this.currentMode = mode;
        this.visionProposal = null;

        if (mode === MODES.IDLE || mode === MODES.SAFETY_LOCK) RobotService.stop();

        this.notifyListeners({ type: 'MODE_CHANGE', value: mode });
    }

    proposeMovement(command, metadata = {}) {
        this.visionProposal = { command, ...metadata, timestamp: Date.now() };
    }

    // --- CORE LOGIC ---

    evaluate() {
        let decision = 'IDLE';
        let reason = 'Waiting';

        // 1. SAFETY CHECK (Centralized)
        const safety = SafetyMonitor.evaluate(this.sensorState, this.currentMode);

        if (!safety.safe) {
            // UNSAFE STATE
            decision = safety.action; // STOP or FREEZE
            reason = safety.reason;

            if (safety.action === 'FREEZE') {
                if (this.currentMode !== MODES.SAFETY_LOCK) {
                    this.setMode(MODES.SAFETY_LOCK);
                    RobotService.stop(); // Kill motors
                    VoiceService.speak("Sensor failure. Freezing.");
                }
                this.notifyListeners(this.captureState(decision, reason));
                return;
            }

            if (safety.action === 'STOP') {
                // Obstacle
                if (this.currentMode !== MODES.AVOID && this.currentMode !== MODES.MANUAL) {
                    this.setMode(MODES.AVOID);
                    RobotService.stop();
                    VoiceService.speak("Obstacle detected.");
                }

                // If In Manual and Blocked -> Stop
                if (this.currentMode === MODES.MANUAL) {
                    RobotService.stop();
                }
            }

            // Broadcast and return
            this.notifyListeners(this.captureState(decision, reason));
            return;
        }

        // RECOVERY from Safety States
        if (this.currentMode === MODES.SAFETY_LOCK) {
            // If we are here, safety.safe is true, meaning sensors are back!
            this.setMode(MODES.IDLE);
            VoiceService.speak("Sensors online. Resuming.");
        }

        if (this.currentMode === MODES.AVOID) {
            this.setMode(MODES.IDLE);
        }

        // 2. NORMAL MODE HANDLING
        switch (this.currentMode) {
            case MODES.IDLE:
                decision = 'HOLD';
                break;

            case MODES.MANUAL:
                decision = 'USER CONTROL';
                reason = 'Admin Override';
                break;

            case MODES.FOLLOW:
                const followRes = this.handleFollowMode();
                if (followRes) {
                    decision = followRes.command;
                    reason = followRes.reason || 'Visual Tracking';
                } else {
                    decision = 'SEARCHING';
                    reason = 'No Target';
                }
                break;

            case MODES.GOTO:
                const gotoRes = this.handleFollowMode();
                if (gotoRes) {
                    decision = gotoRes.command;
                    reason = 'Navigating to Point';
                } else {
                    decision = 'SEARCHING';
                    reason = 'Target Lost';
                }
                break;
        }

        this.notifyListeners(this.captureState(decision, reason));
    }

    handleFollowMode() {
        if (!this.visionProposal) return null;

        const now = Date.now();
        if (now - this.visionProposal.timestamp > 1000) {
            return null;
        }

        // Execute 
        if (this.visionProposal.command === 'STOP') {
            RobotService.stop();
        } else {
            RobotService.sendCommand(this.visionProposal.command);
        }

        return this.visionProposal;
    }
}

export default new DecisionEngine();
