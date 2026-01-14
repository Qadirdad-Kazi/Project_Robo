// DistanceSensor.js
// Simulates a Hardware Distance Sensor (e.g. HC-SR04 Ultrasonic)

import EventEmitter from 'eventemitter3';
import PowerManager from '../system/PowerManager';

class DistanceSensor extends EventEmitter {
    constructor() {
        super();
        this.currentDistance = 200;
        this.minRange = 2;
        this.maxRange = 400;
        this.simInterval = null;

        // Auto-start (Mock)
        this.startSimulation();
    }

    startSimulation() {
        if (this.simInterval) return;

        const updateInterval = () => {
            const interval = PowerManager.getSensorInterval('ULTRASONIC');
            if (this.simInterval) clearInterval(this.simInterval);

            this.simInterval = setInterval(() => {
                const jitter = Math.floor(Math.random() * 5) - 2;
                let newDist = this.currentDistance + jitter;
                if (newDist < this.minRange) newDist = this.minRange;
                if (newDist > this.maxRange) newDist = this.maxRange;
                this.currentDistance = newDist;
                this.emit('distance', this.currentDistance);
            }, interval);
        };

        PowerManager.addListener(() => updateInterval());
        updateInterval(); // Initial
    }

    stopSimulation() {
        if (this.simInterval) {
            clearInterval(this.simInterval);
            this.simInterval = null;
        }
    }

    // Manual Override for UI Testing
    setDistance(cm) {
        this.currentDistance = cm;
        this.emit('distance', this.currentDistance);
    }

    getDistance() {
        return this.currentDistance;
    }
}

export default new DistanceSensor();
