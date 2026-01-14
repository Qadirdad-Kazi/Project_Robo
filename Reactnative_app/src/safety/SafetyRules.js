// SafetyRules.js
// Centralized Safety validation for the Robot.

const RULES = {
    OBSTACLE_STOP_THRESHOLD: 30, // cm
    SENSOR_TIMEOUT_MS: 3000,      // if sensor silent for 3s, assume failure
};

class SafetyMonitor {
    constructor() {
        this.lastSensorUpdate = Date.now();
    }

    notifySensorHeartbeat() {
        this.lastSensorUpdate = Date.now();
    }

    /**
     * Evaluates all Safety Rules.
     * Returns { safe: boolean, reason: string }
     */
    evaluate(sensorState, currentMode, isAdminOverride = false) {
        const now = Date.now();

        // 1. ADMIN OVERRIDE (Highest Priority - if explicit Enable)
        // If Admin is forcing ("Force Drive"), we might ignore some rules.
        // But typically for this project, "Admin wins" means Manual Control takes precedence over auto logic.
        // We will assume Basic Safety (Anti-Collision) applies even to Admin unless 'Unsafe Mode' is set.
        // For now, let's treat collision as absolute unless we define a specific "FORCE" flag.

        // 2. SENSOR HEALTH
        if (now - this.lastSensorUpdate > RULES.SENSOR_TIMEOUT_MS) {
            return {
                safe: false,
                reason: 'CRITICAL: SENSOR FAILURE (TIMEOUT)',
                action: 'FREEZE'
            };
        }

        // 3. COLLISION PREVENTION
        if (sensorState.blocked) {
            // Blocked usually means < 30cm
            return {
                safe: false,
                reason: 'OBSTACLE DETECTED',
                action: 'STOP'
            };
        }

        return { safe: true, reason: 'NOMINAL', action: 'NONE' };
    }

    /**
     * Validates if we should follow a target
     */
    validateFollowTarget(identity) {
        if (!identity) return false;
        if (identity.id === 'UNKNOWN') return false;
        // Strict: Only follow OWNER_001
        if (identity.id === 'OWNER_001') return true;

        return false;
    }
}

export default new SafetyMonitor();
