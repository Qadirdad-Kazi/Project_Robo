// ObstacleLogic.js
// Safety Layer: Monitors sensors and pipes data to the Brain.

import DistanceSensor from './DistanceSensor';
import DecisionEngine from '../core/DecisionEngine';

class ObstacleLogic {
    constructor() {
        this.isEnabled = true;
    }

    start() {
        console.log("[ObstacleLogic] Sensor Monitoring Active");
        DistanceSensor.addListener('distance', this.handleDistanceUpdate.bind(this));
    }

    stop() {
        DistanceSensor.removeListener('distance', this.handleDistanceUpdate.bind(this));
    }

    handleDistanceUpdate(distance) {
        if (!this.isEnabled) return;

        // Pipe sensor data to the Brain
        DecisionEngine.updateSafetyStatus(distance);
    }
}

export default new ObstacleLogic();
