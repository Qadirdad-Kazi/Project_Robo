// FollowOwnerEngine.js
// Logic to translate Face Position into Robot Movement

import DecisionEngine, { MODES } from '../core/DecisionEngine';
import VoiceService from '../services/VoiceService';

class FollowOwnerEngine {
    constructor() {
        this.lastCommandTime = 0;
        this.commandInterval = 200; // ms (Max 5 cmds/sec)

        // Calibration
        this.deadZoneX = 0.2; // 20% center tolerance
        this.targetFaceWidth = 0.3; // If face is 30% of screen width, we are at good distance
        this.stopFaceWidth = 0.45; // If face is 45%, too close -> STOP
    }

    start() {
        console.log("[FollowOwner] Engine STARTED");
        DecisionEngine.setMode(MODES.FOLLOW);
        VoiceService.speak("Tracking mode engaged.");
    }

    stop() {
        console.log("[FollowOwner] Engine STOPPED");
        DecisionEngine.setMode(MODES.IDLE);
    }

    /**
     * Process a video frame face detection to drive the robot
     * @param {Object} face - Expo Face Object
     * @param {Object} frameSize - { width, height } of camera view
     */
    update(face, frameSize) {
        if (DecisionEngine.currentMode !== MODES.FOLLOW || !face) return;

        const now = Date.now();
        if (now - this.lastCommandTime < this.commandInterval) return;

        // 1. Calculate relative metrics (0.0 to 1.0)
        const faceCenterX = (face.bounds.origin.x + (face.bounds.size.width / 2)) / frameSize.width;
        const faceWidthRatio = face.bounds.size.width / frameSize.width;

        let command = null;
        let commandMeta = { reason: 'FOLLOW_FACE' };

        // 2. Steering Logic (X-Axis)
        const deviation = faceCenterX - 0.5;

        // Using simple thresholds
        if (deviation < -this.deadZoneX) {
            command = 'LEFT';
        } else if (deviation > this.deadZoneX) {
            command = 'RIGHT';
        } else {
            // 3. Distance Logic (Z-Axis) -> Only if centered
            if (faceWidthRatio > this.stopFaceWidth) {
                command = 'STOP'; // Too close!
            } else if (faceWidthRatio < this.targetFaceWidth) {
                command = 'FORWARD'; // Follow
            } else {
                command = 'STOP'; // Good distance (Hold)
            }
        }

        // Execute Proposal
        if (command) {
            DecisionEngine.proposeMovement(command, commandMeta);
            this.lastCommandTime = now;
        }
    }
}

export default new FollowOwnerEngine();
