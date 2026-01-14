import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import VirtualMotors from '../simulation/VirtualMotors';

class RobotService {
    constructor() {
        this.isConnected = false;
        this.batteryLevel = 100;
        this.listeners = [];

        // Configuration
        this.USE_BLUETOOTH = false; // Toggle for Real Hardware

        // Simulation State (Mirrored from VirtualMotors)
        this.simState = {
            status: 'IDLE',
            x: 0,
            y: 0,
            direction: 0 // 0=North, 90=East, 180=South, 270=West
        };

        // Battery Drain Simulation
        setInterval(() => {
            if (this.batteryLevel > 0) {
                this.batteryLevel -= 1;
                this.notifyListeners({ type: 'BATTERY', value: this.batteryLevel });
            }
        }, 60000); // 1% per minute

        // Initial Connection Mock
        setTimeout(() => {
            this.isConnected = true;
            this.notifyListeners({ type: 'CONNECTION', value: true });
        }, 1000);
    }

    addListener(callback) {
        this.listeners.push(callback);
        // Send initial state
        callback({ type: 'CONNECTION', value: this.isConnected });
        callback({ type: 'BATTERY', value: this.batteryLevel });
        callback({ type: 'SIM_STATE', value: this.simState });

        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    notifyListeners(data) {
        this.listeners.forEach(cb => cb(data));
    }

    // --- COMMAND INTERFACE ---

    async stop() {
        // console.log("[RobotService] STOP");
        this.simState.status = 'IDLE';

        if (!this.USE_BLUETOOTH) {
            await VirtualMotors.execute('STOP');
        }

        this.notifyListeners({ type: 'SIM_STATE', value: this.simState });
        return true;
    }

    async sendCommand(command, params = {}) {
        if (!this.isConnected) {
            throw new Error("Robot not connected");
        }

        // console.log(`[RobotService] Command: ${command}`);

        if (this.USE_BLUETOOTH) {
            // Hardware logic here (BLE / WiFi)
        } else {
            // --- VIRTUAL MOTORS DELEGATION ---
            const telemetry = await VirtualMotors.execute(command);

            // Sync State
            this.simState.status = telemetry.status;
            this.simState.x = telemetry.position.x;
            this.simState.y = telemetry.position.y;
            this.simState.direction = telemetry.position.heading;
        }

        // Feedback
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Broadcast update
        this.notifyListeners({ type: 'SIM_STATE', value: { ...this.simState } });

        // Also broadcast as generic event
        this.notifyListeners({ ...params, type: 'VOICE_CONTROL', command });

        return { success: true, state: this.simState };
    }

    // --- API ---

    getStatus() {
        return {
            connected: this.isConnected,
            battery: this.batteryLevel,
            ...this.simState
        };
    }

    getBatteryLevel() {
        return this.batteryLevel;
    }

    // Debug helper
    replaySimulation() {
        VirtualMotors.replayPath();
    }
}

export default new RobotService();
