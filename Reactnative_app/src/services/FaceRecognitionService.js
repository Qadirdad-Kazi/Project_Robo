// FaceRecognitionService.js
// Service to manage Identity (Face Detection -> Recognition)

class FaceRecognitionService {
    constructor() {
        this.ownerProfile = null; // { id, name, bioSignature }
        this.recognitionThreshold = 0.85; // Confidence needed

        // Pre-load a dummy profile? No, let user register.
        // Actually, let's pre-load "Qadir" logic for demo if no one registered.
        this.isScanning = true;
    }

    /**
     * Registers the current face as the Owner
     * @param {Object} face - The face object from expo-face-detector
     */
    registerOwner(face) {
        if (!this._isValidFace(face)) return { success: false, error: "Face not clear" };

        const bioSignature = this._generateBiometricSignature(face);

        this.ownerProfile = {
            id: 'OWNER_001',
            name: 'Qadir',
            bioSignature: bioSignature,
            registeredAt: new Date()
        };

        console.log("[FaceRec] Owner Registered:", this.ownerProfile.name);
        return { success: true, profile: this.ownerProfile };
    }

    /**
     * Attempts to recognize a face against the stored owner profile
     * @param {Object} face 
     */
    recognizeFace(face) {
        if (!this.ownerProfile) return { id: 'UNKNOWN', name: 'Unknown', confidence: 0 };
        if (!this._isValidFace(face)) return { id: 'UNKNOWN', name: 'Unknown', confidence: 0 };

        const currentSig = this._generateBiometricSignature(face);
        const matchScore = this._compareSignatures(this.ownerProfile.bioSignature, currentSig);

        if (matchScore >= this.recognitionThreshold) {
            return {
                id: this.ownerProfile.id,
                name: this.ownerProfile.name,
                confidence: matchScore
            };
        }

        return {
            id: 'UNKNOWN',
            name: 'Unknown',
            confidence: matchScore
        };
    }

    /**
     * INTERNAL: Generates a pseudo-embedding based on facial geometry ratios.
     * Real embeddings require a neural net (FaceNet), but this works for basic geometry matching.
     */
    _generateBiometricSignature(face) {
        const { leftEyePosition, rightEyePosition, noseBasePosition, bounds } = face;

        // 1. Calculate Eye Distance (Inter-pupillary distance)
        const eyeDist = Math.hypot(
            rightEyePosition.x - leftEyePosition.x,
            rightEyePosition.y - leftEyePosition.y
        );

        // 2. Calculate Eye Center to Nose Distance
        const eyeCenterX = (leftEyePosition.x + rightEyePosition.x) / 2;
        const eyeCenterY = (leftEyePosition.y + rightEyePosition.y) / 2;

        const noseDist = Math.hypot(
            noseBasePosition.x - eyeCenterX,
            noseBasePosition.y - eyeCenterY
        );

        // 3. Ratio (Face Aspect Ratio equivalent) - Scale Invariant
        const structuralRatio = noseDist / (eyeDist + 0.01); // Avoid div/0

        // 4. Relative Width of face to Eye Distance
        const widthRatio = bounds.size.width / (eyeDist + 0.01);

        return {
            structuralRatio,
            widthRatio
        };
    }

    _compareSignatures(sigA, sigB) {
        // Calculate similarity (1.0 = identical)
        const diff1 = Math.abs(sigA.structuralRatio - sigB.structuralRatio);
        const diff2 = Math.abs(sigA.widthRatio - sigB.widthRatio);

        // Weigh them
        const totalDiff = (diff1 * 0.7) + (diff2 * 0.3);

        // Convert to confidence (0 to 1)
        // A difference of 0 should be 1.0 confidence. 
        // A difference of 0.5 (huge) should be 0.0.
        let confidence = 1 - (totalDiff * 2);
        if (confidence < 0) confidence = 0;

        return parseFloat(confidence.toFixed(2));
    }

    /**
     * SECURE: Delete all local biometric data
     */
    clearOwnerProfile() {
        this.ownerProfile = null;
        console.log("[FaceRec] SECURE: Owner biometrics purged.");
        return true;
    }

    _isValidFace(face) {
        return (
            face &&
            face.leftEyePosition &&
            face.rightEyePosition &&
            face.noseBasePosition &&
            face.bounds
        );
    }
}

export default new FaceRecognitionService();
