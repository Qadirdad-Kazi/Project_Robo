// DecisionEngine.js
// The Core Brain of the Robot.
// Arbitrates between Inputs (Sensors, Vision, User) to decide Movement.

import RobotService from '../services/RobotService';
import VoiceService from '../services/VoiceService';

export const MODES = {
    IDLE: 'IDLE',
    MANUAL: 'MANUAL',
    FOLLOW: 'FOLLOW',
    GOTO: 'GOTO',
    AVOID: 'AVOID', // Emergency avoidance
    DANCE: 'DANCE'
};

class DecisionEngine {
    constructor() {
        this.currentMode = MODES.IDLE;

        // Input States
        this.sensorState = { distance: 200, blocked: false };
        this.visionProposal = null; // { command: 'FORWARD', confidence: 1.0 }

        // Listeners for UI
        this.listeners = [];

        // Settings
        this.safetyEnabled = true;

        // Loop
        this.decisionLoop = setInterval(this.evaluate.bind(this), 250); // 4Hz Decision Cycle (Slower for UI readability)
    }

    // --- OBSERVABILITY ---
    addListener(callback) {
        this.listeners.push(callback);
        // Initial State
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
        this.sensorState.blocked = distance < 30; // 30cm Hard Stop
    }

    /**
     * Set the High-Level Operation Mode
     * @param {string} mode 
     */
    setMode(mode) {
        if (this.currentMode === mode) return;

        console.log(`[DecisionEngine] Mode Change: ${this.currentMode} -> ${mode}`);
        this.currentMode = mode;
        this.visionProposal = null; // Reset Proposals

        // Immediate Feedback
        if (mode === MODES.IDLE) RobotService.stop();

        this.notifyListeners({ type: 'MODE_CHANGE', value: mode });
    }

    /**
     * Specialized Modules propose a move
     * @param {string} command - 'FORWARD', 'LEFT', etc.
     * @param {Object} metadata - { speed, reason }
     */
    proposeMovement(command, metadata = {}) {
        this.visionProposal = { command, ...metadata, timestamp: Date.now() };
    }

    // --- CORE LOGIC ---

    evaluate() {
        let decision = 'IDLE';
        let reason = 'Waiting';

        // 1. SAFETY OVERRIDE (Highest Priority)
        // If we are about to crash, nothing else matters.
        if (this.safetyEnabled && this.sensorState.blocked) {
            decision = 'STOP (SAFETY)';
            reason = 'OBSTACLE DETECTED';

            if (this.currentMode !== MODES.AVOID && this.currentMode !== MODES.MANUAL) {
                console.warn("[DecisionEngine] SAFETY INTERVENTION: OBSTACLE DETECTED");
                this.setMode(MODES.AVOID);
                RobotService.stop();
                VoiceService.speak("Obstacle detected.");
            }
        }
        else if (this.currentMode === MODES.AVOID && !this.sensorState.blocked) {
            // Recovery
            this.setMode(MODES.IDLE);
            decision = 'RECOVERING';
            reason = 'PATH CLEARED';
        }
        else {
            // 2. NORMAL OPERATION
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
                    // Similar to Follow
                    const gotoRes = this.handleFollowMode();
                    if (gotoRes) {
                        decision = gotoRes.command;
                        reason = 'Navigating to Point';
                    }
                    else {
                        decision = 'SEARCHING';
                        reason = 'Target Lost';
                    }
                    break;
            }
        }

        // Broadcast State for Debug UI
        this.notifyListeners(this.captureState(decision, reason));
    }

    handleFollowMode() {
        // Check if we have a fresh proposal (latency check)
        if (!this.visionProposal) return null;

        const now = Date.now();
        if (now - this.visionProposal.timestamp > 1000) {
            // Stale proposal (Vision lost?)
            return null;
        }

        // Execute Proposed Command
        if (this.visionProposal.command === 'STOP') {
            RobotService.stop();
        } else {
            RobotService.sendCommand(this.visionProposal.command);
        }

        return this.visionProposal;
    }
}

export default new DecisionEngine();
