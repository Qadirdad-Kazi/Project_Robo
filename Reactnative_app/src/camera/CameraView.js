import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, Platform } from 'react-native';
import { Camera, useCameraPermissions } from 'expo-camera';
// import * as FaceDetector from 'expo-face-detector'; // Crashy in Expo Go if native module missing
import { Ionicons } from '@expo/vector-icons';

let FaceDetector = null;
try {
    FaceDetector = require('expo-face-detector');
} catch (e) {
    console.warn("FaceDetector module not found");
}
import FrameCaptureService from './FrameCapture.js';
import FaceRecognitionService from '../services/FaceRecognitionService';
import GreetingEngine from '../ai-behavior/GreetingEngine';
import VoiceService from '../services/VoiceService';
import VisionDebugService from '../services/VisionDebugService';
import FollowOwnerEngine from '../navigation/FollowOwnerEngine';
import GoToPointEngine from '../navigation/GoToPointEngine';

const CameraViewComponent = ({ showFps = false, showDebugOverlay = true, enableSocial = true, onFrame }) => {
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [cameraReady, setCameraReady] = useState(false);
    const [faces, setFaces] = useState([]);

    // Check if FaceDetector is available
    let isFaceDetectorAvailable = false;
    try {
        isFaceDetectorAvailable = !!(FaceDetector && FaceDetector.FaceDetectorMode);
    } catch (e) {
        console.warn("Face Detector module missing (Expo Go limitation).");
    }

    const [fps, setFps] = useState(0);
    const [cameraLayout, setCameraLayout] = useState({ width: 0, height: 0 });

    const cameraRef = useRef(null);

    // FPS Calc
    const fpsFrameCount = useRef(0);
    const lastTime = useRef(performance.now());

    useEffect(() => {
        const loop = () => {
            const now = performance.now();
            fpsFrameCount.current++;
            if (now - lastTime.current >= 1000) {
                const currentFps = fpsFrameCount.current;
                setFps(currentFps);
                VisionDebugService.update({ fps: currentFps });
                fpsFrameCount.current = 0;
                lastTime.current = now;
            }
            requestAnimationFrame(loop);
        };
        const handle = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(handle);
    }, []);

    const handleScreenTap = (event) => {
        if (!showDebugOverlay || cameraLayout.width === 0) return;

        const { locationX, locationY } = event.nativeEvent;
        // console.log(`[Camera] Tap at ${locationX.toFixed(0)}, ${locationY.toFixed(0)}`);

        GoToPointEngine.navigateToPoint(locationX, locationY, cameraLayout.width, cameraLayout.height);
    };

    // Face Detection Handler
    const handleFacesDetected = ({ faces }) => {
        if (faces.length > 0) {
            let primaryIdentity = null;
            let primaryFace = null;
            let maxConfidence = 0;
            let maxFaceWidth = 0;

            const processedFaces = faces.map(face => {
                const identity = FaceRecognitionService.recognizeFace(face);

                if (identity.confidence > maxConfidence) {
                    maxConfidence = identity.confidence;
                    primaryIdentity = identity;
                }

                if (face.bounds.size.width > maxFaceWidth) {
                    maxFaceWidth = face.bounds.size.width;
                    primaryFace = face;
                }

                return { ...face, identity };
            });

            if (enableSocial && primaryIdentity && primaryIdentity.confidence > 0.85) {
                // Pass Face Object for Emotion Analysis
                const emotion = EmotionEngine.analyzeFace(primaryFace);
                VisionDebugService.updateEmotion(emotion);

                const greeting = GreetingEngine.evaluateGreeting(primaryIdentity, primaryFace);
                if (greeting) {
                    VoiceService.speak(greeting);
                    VisionDebugService.updateGreeting(greeting);
                }
            }

            if (primaryFace && cameraLayout.width > 0) {
                // Pass Identity for Safety Checks
                FollowOwnerEngine.update(primaryFace, cameraLayout, primaryIdentity);
            }

            VisionDebugService.update({
                faceDetected: true,
                faceCount: faces.length,
                confidence: maxConfidence,
                identity: primaryIdentity ? primaryIdentity.name : 'Unknown'
            });

            setFaces(processedFaces);
        } else {
            setFaces([]);
            VisionDebugService.update({
                faceDetected: false,
                faceCount: 0,
                confidence: 0,
                identity: 'NONE'
            });
        }
    };

    // Register the largest face as owner
    const handleRegisterOwner = () => {
        if (faces.length === 0) return;

        const primaryFace = faces.reduce((prev, current) => {
            return (prev.bounds.size.width > current.bounds.size.width) ? prev : current;
        });

        const result = FaceRecognitionService.registerOwner(primaryFace);
        if (result.success) {
            alert(`Registered Owner: ${result.profile.name}`);
        } else {
            alert("Could not register face. Move closer/steady.");
        }
    };

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Camera permission required for vision.</Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    const handleCapture = async () => {
        if (cameraRef.current) {
            FrameCaptureService.captureManual(cameraRef.current);
        }
    };

    return (
        <View style={styles.container}>
            <Camera
                style={styles.camera}
                type={facing}
                ref={cameraRef}
                onCameraReady={() => setCameraReady(true)}
                onLayout={(event) => setCameraLayout(event.nativeEvent.layout)}
                onFacesDetected={isFaceDetectorAvailable ? handleFacesDetected : undefined}
                faceDetectorSettings={isFaceDetectorAvailable ? {
                    mode: FaceDetector.FaceDetectorMode.fast,
                    detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
                    runClassifications: FaceDetector.FaceDetectorClassifications.none,
                    minDetectionInterval: 200,
                    tracking: true,
                } : undefined}
            >
                <View style={styles.overlay}>
                    {/* Navigation Tap Layer (Active in Admin Mode) */}
                    {showDebugOverlay && (
                        <TouchableOpacity
                            style={StyleSheet.absoluteFill}
                            activeOpacity={1}
                            onPress={handleScreenTap}
                        />
                    )}

                    {/* Face Bounding Boxes (Debug Only) */}
                    {showDebugOverlay && (
                        <View style={StyleSheet.absoluteFill} pointerEvents="none">
                            {faces.map((face, index) => {
                                const isOwner = face.identity?.id === 'OWNER_001';
                                const confidence = face.identity?.confidence || 0;
                                const borderColor = isOwner ? '#00E676' : '#00E5FF';

                                return (
                                    <View
                                        key={index}
                                        style={[
                                            styles.faceBox,
                                            {
                                                left: face.bounds.origin.x,
                                                top: face.bounds.origin.y,
                                                width: face.bounds.size.width,
                                                height: face.bounds.size.height,
                                                borderColor: borderColor,
                                                backgroundColor: isOwner ? 'rgba(0, 230, 118, 0.1)' : 'rgba(0, 229, 255, 0.1)'
                                            }
                                        ]}
                                    >
                                        <View style={styles.landmarkContainer}>
                                            {face.leftEyePosition && <View style={[styles.landmark, { left: face.leftEyePosition.x - face.bounds.origin.x, top: face.leftEyePosition.y - face.bounds.origin.y }]} />}
                                            {face.rightEyePosition && <View style={[styles.landmark, { left: face.rightEyePosition.x - face.bounds.origin.x, top: face.rightEyePosition.y - face.bounds.origin.y }]} />}
                                            {face.noseBasePosition && <View style={[styles.landmark, { left: face.noseBasePosition.x - face.bounds.origin.x, top: face.noseBasePosition.y - face.bounds.origin.y, backgroundColor: 'yellow' }]} />}
                                        </View>

                                        <View style={[styles.faceLabelContainer, { backgroundColor: isOwner ? 'rgba(0, 230, 118, 0.8)' : 'rgba(0,0,0,0.6)' }]}>
                                            <Text style={styles.faceLabel}>
                                                {isOwner ? `OWNER: ${face.identity.name} (${(confidence * 100).toFixed(0)}%)` : 'UNKNOWN TARGET'}
                                            </Text>
                                        </View>
                                    </View>
                                )
                            })}
                        </View>
                    )}

                    <View style={styles.uiLayer}>
                        <View style={styles.controlsContainer}>
                            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                                <Ionicons name="camera-reverse-outline" size={28} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
                                <View style={styles.captureBtnInner} />
                            </TouchableOpacity>

                            {showDebugOverlay && (
                                <TouchableOpacity style={styles.button} onPress={handleRegisterOwner}>
                                    <Ionicons name="person-add-outline" size={28} color="white" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Camera>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#000',
        borderRadius: 12,
        overflow: 'hidden',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: '#fff'
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    uiLayer: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 10,
        zIndex: 20 // Ensure controls are above click layer
    },
    faceBox: {
        position: 'absolute',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
    },
    faceLabelContainer: {
        position: 'absolute',
        bottom: -20,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    faceLabel: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    landmarkContainer: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
    },
    landmark: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#69F0AE',
        zIndex: 20
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        alignSelf: 'center',
        width: '100%'
    },
    button: {
        padding: 5,
    },
    captureBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureBtnInner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#000',
        backgroundColor: '#fff'
    },
});

export default CameraViewComponent;
