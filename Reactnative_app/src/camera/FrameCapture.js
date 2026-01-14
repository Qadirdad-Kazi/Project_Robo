// FrameCapture.js
// Utility to handle manual and automatic frame capture

class FrameCaptureService {
    constructor() {
        this.autoCaptureInterval = null;
        this.isAutoCapturing = false;
        this.onFrameCaptured = null;
    }

    setCallback(callback) {
        this.onFrameCaptured = callback;
    }

    async captureManual(cameraRef) {
        if (cameraRef && cameraRef.takePictureAsync) {
            try {
                const photo = await cameraRef.takePictureAsync({ quality: 0.5, base64: true });
                console.log("[FrameCapture] Manual frame captured");
                if (this.onFrameCaptured) {
                    this.onFrameCaptured(photo);
                }
                return photo;
            } catch (error) {
                console.error("[FrameCapture] Capture failed", error);
            }
        }
    }

    startAutoCapture(cameraRef, intervalMs = 1000) {
        if (this.isAutoCapturing) return;

        console.log(`[FrameCapture] Starting auto-capture every ${intervalMs}ms`);
        this.isAutoCapturing = true;

        this.autoCaptureInterval = setInterval(async () => {
            if (cameraRef && this.isAutoCapturing) {
                await this.captureManual(cameraRef);
            }
        }, intervalMs);
    }

    stopAutoCapture() {
        if (this.autoCaptureInterval) {
            clearInterval(this.autoCaptureInterval);
            this.autoCaptureInterval = null;
        }
        this.isAutoCapturing = false;
        console.log("[FrameCapture] Stopped auto-capture");
    }
}

export default new FrameCaptureService();
