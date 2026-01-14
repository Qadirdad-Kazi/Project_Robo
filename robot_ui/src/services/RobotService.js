import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Simulation of a Robot Connection & Physics Service
class RobotService {
    constructor() {
        this.isConnected = true;
        this.batteryLevel = 85;
        this.listeners = [];

        // Virtual Robot Simulation State
        this.simState = {
            x: 0, // Grid coordinates (0,0 is center)
            y: 0,
            direction: 0, // 0=North, 90=East, 180=South, 270=West
            status: 'IDLE' // IDLE, MOVING, TURNING, DANCING
        };

        // Simulate telemetry/physics logic loop
        setInterval(() => {
            this.simulateTelemetry();
        }, 1000); // 1Hz update for battery/random
    }

    simulateTelemetry() {
        let hasUpdates = false;

        // 1. Battery Drain (slower)
        if (this.batteryLevel > 0 && Math.random() > 0.98) {
            this.batteryLevel -= 1;
            this.notifyListeners({ type: 'BATTERY', value: this.batteryLevel });
            hasUpdates = true;
        }

        // 2. Random connection flutter (Rare)
        if (Math.random() > 0.995) {
            this.isConnected = !this.isConnected;
            this.notifyListeners({ type: 'CONNECTION', value: this.isConnected });
            hasUpdates = true;
        }
    }

    addListener(callback) {
        this.listeners.push(callback);
        // Send initial state immediately
        callback({ type: 'SIM_STATE', value: { ...this.simState } });
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    notifyListeners(data) {
        this.listeners.forEach(cb => cb(data));
    }

    // Helper to normalize angle to 0-359
    _normalizeAngle(angle) {
        let a = angle % 360;
        if (a < 0) a += 360;
        return a;
    }

    async sendCommand(command, params = {}) {
        if (!this.isConnected) {
            throw new Error("Robot not connected");
        }

        console.log(`[RobotService] Command Received: ${command}`, params);

        // --- SIMULATION PHYSICS ENGINE ---

        const prevStatus = this.simState.status;
        this.simState.status = 'EXECUTING';
        this.notifyListeners({ type: 'SIM_STATE', value: { ...this.simState } });

        // Simulate network/execution delay
        await new Promise(resolve => setTimeout(resolve, 500));

        switch (command) {
            case 'MOVE_FORWARD':
            case 'FORWARD':
                // Move 1 unit in the current direction
                // Simple grid math: 0=Up(y+1), 90=Right(x+1), etc.
                // Using standard trig: x + cos(theta), y + sin(theta) if 0 is East? 
                // Let's stick to compass: 0=N (y+), 90=E (x+), 180=S (y-), 270=W (x-)
                const rad = (this.simState.direction - 90) * (Math.PI / 180); // Adjust for math standard
                // Actually simpler:
                if (this.simState.direction === 0) this.simState.y += 1;
                else if (this.simState.direction === 90) this.simState.x += 1;
                else if (this.simState.direction === 180) this.simState.y -= 1;
                else if (this.simState.direction === 270) this.simState.x -= 1;
                else {
                    // Diagonal or arbitrary (just simplified for D-pad logic)
                    this.simState.y += Math.cos(this.simState.direction * (Math.PI / 180));
                    this.simState.x += Math.sin(this.simState.direction * (Math.PI / 180));
                }
                this.simState.status = 'MOVING';
                break;

            case 'MOVE_BACKWARD':
            case 'BACKWARD':
                if (this.simState.direction === 0) this.simState.y -= 1;
                else if (this.simState.direction === 90) this.simState.x -= 1;
                else if (this.simState.direction === 180) this.simState.y += 1;
                else if (this.simState.direction === 270) this.simState.x += 1;
                this.simState.status = 'MOVING';
                break;

            case 'TURN_LEFT':
            case 'LEFT':
                this.simState.direction = this._normalizeAngle(this.simState.direction - 90);
                this.simState.status = 'TURNING';
                break;

            case 'TURN_RIGHT':
            case 'RIGHT':
                this.simState.direction = this._normalizeAngle(this.simState.direction + 90);
                this.simState.status = 'TURNING';
                break;

            case 'STOP':
                this.simState.status = 'IDLE';
                break;

            case 'DANCE':
            case 'ENTERTAIN_DANCE':
                this.simState.status = 'DANCING';
                break;

            default:
                this.simState.status = 'IDLE';
                break;
        }

        // Feedback
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Broadcast update
        this.notifyListeners({ type: 'SIM_STATE', value: { ...this.simState } });

        // Reset status to IDLE after a moment if it was a move action (discrete step simulation)
        if (this.simState.status !== 'DANCING') {
            setTimeout(() => {
                this.simState.status = 'IDLE';
                this.notifyListeners({ type: 'SIM_STATE', value: { ...this.simState } });
            }, 1000);
        }

        // Also broadcast the original event for logs
        this.notifyListeners({ ...params, type: 'VOICE_CONTROL', command }); // Ensure consistent type for Admin

        return { success: true, state: this.simState };
    }

    getStatus() {
        return {
            batteryLevel: this.batteryLevel,
            isConnected: this.isConnected,
            simState: this.simState
        };
    }
}

export default new RobotService();
