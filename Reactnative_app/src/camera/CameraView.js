import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, Platform } from 'react-native';
import { Camera } from 'expo-camera'; // Using Legacy Camera for Face Detection support in Expo Go
import * as FaceDetector from 'expo-face-detector';
import { Ionicons } from '@expo/vector-icons';
import FrameCaptureService from './FrameCapture.js';
import FaceRecognitionService from '../services/FaceRecognitionService';
import GreetingEngine from '../ai-behavior/GreetingEngine';
import VoiceService from '../services/VoiceService';
import VisionDebugService from '../services/VisionDebugService';

const CameraViewComponent = ({ showFps = false, showDebugOverlay = true, enableSocial = true, onFrame }) => {
    const [facing, setFacing] = useState(Camera.Constants.Type.back);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [cameraReady, setCameraReady] = useState(false);
    const [faces, setFaces] = useState([]);
    const [fps, setFps] = useState(0); // State for FPS display

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
                VisionDebugService.update({ fps: currentFps }); // Broadcast FPS
                fpsFrameCount.current = 0;
                lastTime.current = now;
            }
            requestAnimationFrame(loop);
        };
        const handle = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(handle);
    }, []); // Always run FPS loop even if not showing in User UI, for Admin Debug

    // Face Detection Handler
    const handleFacesDetected = ({ faces }) => {
        if (faces.length > 0) {
            // Process faces & Find Primary
            let primaryIdentity = null;
            let maxConfidence = 0;

            const processedFaces = faces.map(face => {
                const identity = FaceRecognitionService.recognizeFace(face);

                // Track stats for debug
                if (identity.confidence > maxConfidence) {
                    maxConfidence = identity.confidence;
                    primaryIdentity = identity;
                }

                return { ...face, identity };
            });

            // Social Logic on Primary Face
            if (enableSocial && primaryIdentity && primaryIdentity.confidence > 0.85) {
                const greeting = GreetingEngine.evaluateGreeting(primaryIdentity);
                if (greeting) {
                    VoiceService.speak(greeting);
                    VisionDebugService.updateGreeting(greeting);
                }
            }

            // Broadcast Vision Stats
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

        // Find largest face (closest)
        const primaryFace = faces.reduce((prev, current) => {
            return (prev.bounds.size.width > current.bounds.size.width) ? prev : current;
        });

        const result = FaceRecognitionService.registerOwner(primaryFace);
        if (result.success) {
            // Trigger a re-render or toast?
            // For now just console/visual feedback next frame
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
        setFacing(current => (
            current === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
        ));
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

                // Face Detection Props
                onFacesDetected={handleFacesDetected}
                faceDetectorSettings={{
                    mode: FaceDetector.FaceDetectorMode.fast,
                    detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
                    runClassifications: FaceDetector.FaceDetectorClassifications.none,
                    minDetectionInterval: 200, // Reduced to 5fps for processing time
                    tracking: true,
                }}
            >
                <View style={styles.overlay}>
                    {/* Face Bounding Boxes (Debug Only) */}
                    {showDebugOverlay && (
                        <View style={StyleSheet.absoluteFill}>
                            {faces.map((face, index) => {
                                const isOwner = face.identity?.id === 'OWNER_001';
                                const confidence = face.identity?.confidence || 0;
                                const borderColor = isOwner ? '#00E676' : '#00E5FF'; // Green for Owner, Blue for guest

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
                        {/* Controls */}
                        <View style={styles.controlsContainer}>
                            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                                <Ionicons name="camera-reverse-outline" size={28} color="white" />
                            </TouchableOpacity>

                            {/* Capture Frame */}
                            <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
                                <View style={styles.captureBtnInner} />
                            </TouchableOpacity>

                            {/* Register Face Button (Only if Debug Overlay is ON, i.e. Admin/Training Mode) */}
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
        padding: 10
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
        color: '#FFF', // White text
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
