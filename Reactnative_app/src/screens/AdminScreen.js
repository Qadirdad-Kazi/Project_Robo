import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import RobotService from '../services/RobotService';
import VisionDebugService from '../services/VisionDebugService';
import FaceRecognitionService from '../services/FaceRecognitionService';
import DistanceSensor from '../sensors/DistanceSensor';
import CameraViewComponent from '../camera/CameraView';
import DecisionEngine from '../core/DecisionEngine';
import MediaController from '../media/MediaController';
import TaskScheduler from '../tasks/TaskScheduler';
import PowerManager from '../system/PowerManager';

const AdminScreen = ({ navigation }) => {
    const isFocused = useIsFocused();
    const [logs, setLogs] = useState([]);
    const [lastVoiceCmd, setLastVoiceCmd] = useState(null);
    const [distance, setDistance] = useState(200);

    const [cortexState, setCortexState] = useState({
        mode: 'OFFLINE',
        decision: 'WAITING',
        reason: 'Initializing...',
        safety: { blocked: false }
    });

    const [mediaState, setMediaState] = useState({ status: 'IDLE', track: null });
    const [tasks, setTasks] = useState([]);
    const [power, setPower] = useState({ level: 100, mode: 'HIGH_PERF', charging: false }); // Power State

    const [visionStats, setVisionStats] = useState({
        fps: 0,
        faceDetected: false,
        faceCount: 0,
        confidence: 0,
        identity: 'NONE',
        lastGreeting: 'None'
    });

    const scrollViewRef = useRef();

    useEffect(() => {
        addLog("Admin Console Initialized");

        // Power Listener
        const unsubscribePower = PowerManager.addListener((state) => {
            setPower(state);
        });

        // Cortex Link
        const unsubscribeCortex = DecisionEngine.addListener((data) => {
            if (data.type === 'THINK') {
                setCortexState(data);
            }
        });

        // Media Listener
        const unsubscribeMedia = MediaController.addListener((state) => {
            setMediaState(state);
        });

        // Task Listener
        const unsubscribeTasks = TaskScheduler.addListener((list) => {
            setTasks(list);
        });

        // Distance Sensor Listener
        const onDistance = (val) => setDistance(val);
        DistanceSensor.addListener('distance', onDistance);

        // Robot Service Listener
        const unsubscribeRobot = RobotService.addListener((data) => {
            if (data.type === 'VOICE_CONTROL') {
                setLastVoiceCmd({
                    raw: data.raw,
                    intent: data.intent || 'UNKNOWN',
                    confidence: data.confidence,
                    params: data.parameters,
                    status: 'SUCCESS',
                    timestamp: new Date().toLocaleTimeString()
                });
                addLog(`AI Heard: "${data.raw}"`, 'AI');
            }
            else if (data.type === 'CONNECTION') {
                addLog(`Connection: ${data.value ? 'Online' : 'Offline'}`, 'NET');
            }
        });

        // Vision Listener
        const unsubscribeVision = VisionDebugService.addListener((data) => {
            setVisionStats(data);
        });

        return () => {
            unsubscribePower();
            unsubscribeCortex();
            unsubscribeMedia();
            unsubscribeTasks();
            DistanceSensor.removeListener('distance', onDistance);
            unsubscribeRobot();
            unsubscribeVision();
        };
    }, []);

    const addLog = (action, type = 'INFO') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] [${type}] ${action}`, ...prev]);
    };

    const handleControl = async (direction) => {
        try {
            await RobotService.sendCommand(direction);
            addLog(`Manual Override: ${direction}`, 'CMD');
        } catch (e) {
            addLog(`Failed: ${e.message}`, 'ERR');
        }
    };

    const handlePurgeBiometrics = () => {
        Alert.alert(
            "Purge Biometrics",
            "Are you sure? This will delete the Owner Face Profile locally.",
            [
                { text: "Cancel", style: 'cancel' },
                {
                    text: "Delete",
                    style: 'destructive',
                    onPress: () => {
                        FaceRecognitionService.clearOwnerProfile();
                        addLog("Biometrics Purged", "SEC");
                    }
                }
            ]
        );
    };

    // Test Safety System
    const triggerObstacle = () => {
        DistanceSensor.setDistance(15);
        addLog("Simulated Obstacle (15cm)", "TEST");
    };

    const clearObstacle = () => {
        DistanceSensor.setDistance(200);
        addLog("Cleared Path", "TEST");
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Admin Intelligence</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 50 }}>

                {/* 0. LIVE VISION FEED (ADMIN MODE) */}
                <View style={styles.adminCameraContainer}>
                    <Text style={styles.sectionLabel}>RAW VISION FEED</Text>
                    <View style={styles.cameraWrapper}>
                        {isFocused && (
                            <CameraViewComponent
                                showFps={true}
                                showDebugOverlay={true}
                                enableSocial={false}
                            />
                        )}
                    </View>
                </View>

                {/* 0.05 POWER & ENERGY (NEW) */}
                <View style={[styles.inspectorCard, { borderLeftColor: power.level < 20 ? '#F44336' : '#00E676' }]}>
                    <View style={styles.inspectorHeader}>
                        <Ionicons name={power.isCharging ? "battery-charging" : "battery-full"} size={18} color={power.level < 20 ? '#F44336' : '#00E676'} />
                        <Text style={[styles.inspectorTitle, { color: power.level < 20 ? '#F44336' : '#00E676' }]}>ENERGY CORE</Text>
                        <View style={[styles.statusBadge, { backgroundColor: '#333' }]}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{power.level}%</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text style={styles.label}>MODE</Text>
                            <Text style={[styles.value, { color: '#FFF' }]}>{power.mode}</Text>
                        </View>
                        <View>
                            <Text style={styles.label}>VOLTAGE</Text>
                            <Text style={[styles.value, { color: '#AAA' }]}>12.4 V</Text>
                        </View>
                    </View>
                </View>

                {/* 0.1 CORTEX NEURAL LINK (BRAIN) */}
                <View style={[styles.inspectorCard, { borderLeftColor: '#E040FB' }]}>
                    <View style={styles.inspectorHeader}>
                        <Ionicons name="git-network-outline" size={18} color="#E040FB" />
                        <Text style={[styles.inspectorTitle, { color: '#E040FB' }]}>CORTEX NEURAL LINK</Text>
                        <View style={[styles.statusBadge, { backgroundColor: cortexState.safety?.blocked ? '#D32F2F' : '#333' }]}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                                {cortexState.safety?.blocked ? 'SAFETY LOCK' : 'ACTIVE'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.gridContainer}>
                        <View style={{ width: '100%', marginBottom: 10 }}>
                            <Text style={styles.label}>CURRENT MODE</Text>
                            <Text style={[styles.value, { fontSize: 18, color: '#E040FB' }]}>
                                {cortexState.mode}
                            </Text>
                        </View>

                        <View style={styles.gridItem}>
                            <Text style={styles.label}>DECISION</Text>
                            <Text style={[styles.value, { color: '#FFF' }]}>{cortexState.decision}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>LOGIC REASON</Text>
                            <Text style={[styles.value, { color: '#AAA', fontStyle: 'italic' }]}>
                                "{cortexState.reason}"
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 0.2 MEDIA CONTROLLER (NEW) */}
                <View style={[styles.inspectorCard, { borderLeftColor: '#9C27B0' }]}>
                    <View style={styles.inspectorHeader}>
                        <Ionicons name="musical-notes-outline" size={18} color="#9C27B0" />
                        <Text style={[styles.inspectorTitle, { color: '#9C27B0' }]}>MEDIA SYSTEM</Text>
                        <View style={[styles.statusBadge, { backgroundColor: mediaState.status === 'PLAYING' ? '#9C27B0' : '#333' }]}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{mediaState.status}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>CURRENT TRACK</Text>
                            <Text style={[styles.value, { color: '#E1BEE7', fontStyle: mediaState.track ? 'italic' : 'normal' }]}>
                                {mediaState.track || "No media playing"}
                            </Text>
                        </View>
                        {mediaState.status === 'PLAYING' && (
                            <TouchableOpacity onPress={() => MediaController.pause()} style={[styles.miniBtn, { backgroundColor: '#7B1FA2' }]}>
                                <Ionicons name="pause" size={16} color="#FFF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* 0.3 MISSION SCHEDULE (NEW) */}
                <View style={[styles.inspectorCard, { borderLeftColor: '#FF9800' }]}>
                    <View style={styles.inspectorHeader}>
                        <Ionicons name="time-outline" size={18} color="#FF9800" />
                        <Text style={[styles.inspectorTitle, { color: '#FF9800' }]}>MISSION SCHEDULE</Text>
                        <View style={[styles.statusBadge, { backgroundColor: '#333' }]}>
                            <Text style={{ color: '#AAA', fontSize: 10 }}>{tasks.length} PENDING</Text>
                        </View>
                    </View>

                    {tasks.length === 0 ? (
                        <Text style={{ color: '#666', fontStyle: 'italic', fontSize: 12 }}>No active directives.</Text>
                    ) : (
                        tasks.slice(0, 3).map((task, i) => (
                            <View key={task.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                <Text style={styles.value}>• {task.description}</Text>
                                <Text style={[styles.valueCode, { color: '#FFB74D' }]}>
                                    {new Date(task.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                {/* 0.5 SENSOR ARRAY */}
                <View style={[styles.inspectorCard, { borderLeftColor: '#FFEB3B' }]}>
                    <View style={styles.inspectorHeader}>
                        <Ionicons name="pulse" size={18} color="#FFEB3B" />
                        <Text style={[styles.inspectorTitle, { color: '#FFEB3B' }]}>SENSOR ARRAY</Text>
                        <View style={[styles.statusBadge, { backgroundColor: distance < 30 ? '#D32F2F' : '#333' }]}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                                {distance < 30 ? 'CRITICAL' : 'NOMINAL'}
                            </Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View>
                            <Text style={styles.label}>ULTRASONIC RANGE</Text>
                            <Text style={[styles.value, { fontSize: 24, color: distance < 50 ? '#FF5252' : '#FFF' }]}>
                                {distance} cm
                            </Text>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity style={[styles.miniBtn, { backgroundColor: '#D32F2F' }]} onPress={triggerObstacle}>
                                <Text style={styles.miniBtnText}>BLOCK</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.miniBtn, { backgroundColor: '#388E3C' }]} onPress={clearObstacle}>
                                <Text style={styles.miniBtnText}>CLEAR</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* 1. VISION ENGINE DEBUG */}
                <View style={[styles.inspectorCard, { borderLeftColor: '#00E676' }]}>
                    <View style={styles.inspectorHeader}>
                        <Ionicons name="eye-outline" size={18} color="#00E676" />
                        <Text style={[styles.inspectorTitle, { color: '#00E676' }]}>VISION SYSTEM</Text>
                        <View style={styles.statusBadge}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{visionStats.fps} FPS</Text>
                        </View>
                    </View>

                    <View style={styles.gridContainer}>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>TARGET ID</Text>
                            <Text style={[styles.value, { color: visionStats.identity === 'Qadir' ? '#00E676' : '#FFF' }]}>
                                {visionStats.identity}
                            </Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>CONFIDENCE</Text>
                            <Text style={styles.value}>{(visionStats.confidence * 100).toFixed(0)}%</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>EMOTION</Text>
                            <Text style={[styles.value, { color: '#F48FB1' }]}>{visionStats.emotion || "NEUTRAL"}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>LAST GREETING</Text>
                            <Text style={[styles.valueCode, { fontSize: 10 }]} numberOfLines={1}>
                                "{visionStats.lastGreeting}"
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 2. PRIVACY & SECURITY CONTROLS */}
                <View style={[styles.inspectorCard, { borderLeftColor: '#F44336' }]}>
                    <View style={styles.inspectorHeader}>
                        <Ionicons name="shield-checkmark-outline" size={18} color="#F44336" />
                        <Text style={[styles.inspectorTitle, { color: '#F44336' }]}>PRIVACY & SECURITY</Text>
                        <View style={[styles.statusBadge, { backgroundColor: '#333' }]}>
                            <Text style={{ color: '#AAA', fontSize: 10 }}>LOCAL ONLY</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#D32F2F' }]}
                            onPress={handlePurgeBiometrics}
                        >
                            <Ionicons name="trash-outline" size={20} color="#FFF" />
                            <Text style={styles.actionBtnText}>PURGE FACE DATA</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#FFA000' }]}
                            onPress={() => {
                                FaceRecognitionService.clearOwnerProfile();
                                navigation.navigate('User');
                                addLog("Initiated Retraining", "SEC");
                            }}
                        >
                            <Ionicons name="scan-outline" size={20} color="#FFF" />
                            <Text style={styles.actionBtnText}>RE-TRAIN OWNER</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 3. NEURAL ENGINE DEBUG */}
                {lastVoiceCmd && (
                    <View style={styles.inspectorCard}>
                        <View style={styles.inspectorHeader}>
                            <Ionicons name="hardware-chip-outline" size={18} color="#00E5FF" />
                            <Text style={styles.inspectorTitle}>NEURAL ENGINE DEBUG</Text>
                            <View style={[styles.statusBadge, { backgroundColor: lastVoiceCmd.status === 'SUCCESS' ? '#4CAF50' : '#F44336' }]}>
                                <Text style={styles.statusText}>{lastVoiceCmd.status}</Text>
                            </View>
                        </View>

                        <View style={styles.gridContainer}>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>RAW INPUT</Text>
                                <Text style={styles.value} numberOfLines={1}>"{lastVoiceCmd.raw}"</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>INTENT</Text>
                                <Text style={[styles.value, { color: '#00E5FF' }]}>{lastVoiceCmd.intent}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>CONFIDENCE</Text>
                                <Text style={[styles.value, { color: lastVoiceCmd.confidence > 0.8 ? '#69F0AE' : '#FFD740' }]}>
                                    {(lastVoiceCmd.confidence * 100).toFixed(0)}%
                                </Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>PARAMETERS</Text>
                                <Text style={styles.valueCode}>
                                    {JSON.stringify(lastVoiceCmd.params || {}, null, 0)}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                <View style={styles.splitView}>
                    {/* LEFT: LOGS */}
                    <View style={styles.debugSection}>
                        <Text style={styles.sectionTitle}>System Stream</Text>
                        <View style={styles.logContainer}>
                            <ScrollView
                                ref={scrollViewRef}
                                nestedScrollEnabled
                                contentContainerStyle={{ paddingBottom: 10 }}
                            >
                                {logs.length === 0 && <Text style={styles.logText}>Waiting for input...</Text>}
                                {logs.map((log, index) => {
                                    const isError = log.includes('[ERR]');
                                    const isCmd = log.includes('[CMD]');
                                    const isAI = log.includes('[AI]');
                                    const isNet = log.includes('[NET]');
                                    const isSec = log.includes('[SEC]');

                                    const colorStyle = isError ? styles.logError :
                                        isCmd ? styles.logCmd :
                                            isAI ? styles.logAI :
                                                isNet ? styles.logNet :
                                                    isSec ? styles.logSec : {};

                                    return (
                                        <Text key={index} style={[styles.logText, colorStyle]}>
                                            {log}
                                        </Text>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </View>

                    {/* RIGHT: CONTROLS */}
                    <View style={styles.controlsSection}>
                        <Text style={styles.sectionTitle}>Manual Override</Text>
                        <View style={styles.dpadContainer}>
                            <View style={styles.dpadRow}>
                                <TouchableOpacity style={styles.controlBtn} onPress={() => handleControl('FORWARD')}>
                                    <Ionicons name="chevron-up" size={28} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.dpadRow}>
                                <TouchableOpacity style={styles.controlBtn} onPress={() => handleControl('LEFT')}>
                                    <Ionicons name="chevron-back" size={28} color="#FFF" />
                                </TouchableOpacity>
                                <View style={styles.centerSpacer}>
                                    <Ionicons name="radio-outline" size={20} color="#555" />
                                </View>
                                <TouchableOpacity style={styles.controlBtn} onPress={() => handleControl('RIGHT')}>
                                    <Ionicons name="chevron-forward" size={28} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.dpadRow}>
                                <TouchableOpacity style={styles.controlBtn} onPress={() => handleControl('BACKWARD')}>
                                    <Ionicons name="chevron-down" size={28} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0D',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingBottom: 20,
        backgroundColor: '#151515',
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    headerTitle: {
        color: '#E0E0E0',
        fontSize: 20,
        fontWeight: 'bold',
        fontVariant: ['small-caps'],
    },
    content: {
        flex: 1,
        paddingTop: 10,
    },
    backButton: {
        padding: 5
    },
    adminCameraContainer: {
        marginHorizontal: 15,
        marginBottom: 10,
        height: 250,
        backgroundColor: '#000',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
        overflow: 'hidden'
    },
    sectionLabel: {
        position: 'absolute',
        top: 5,
        left: 10,
        zIndex: 10,
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    cameraWrapper: {
        flex: 1
    },
    inspectorCard: {
        backgroundColor: '#1E1E1E',
        marginHorizontal: 15,
        marginTop: 5,
        marginBottom: 10,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#00E5FF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        padding: 12,
    },
    inspectorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 8,
    },
    inspectorTitle: {
        color: '#AAA',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 6,
        flex: 1,
        letterSpacing: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gridItem: {
        width: '50%',
        marginBottom: 8,
    },
    label: {
        color: '#555',
        fontSize: 10,
        marginBottom: 2,
    },
    value: {
        color: '#E0E0E0',
        fontSize: 13,
        fontWeight: '600',
    },
    valueCode: {
        color: '#FFA726',
        fontSize: 11,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    splitView: {
        flex: 1,
        flexDirection: 'column',
        paddingHorizontal: 15,
    },
    sectionTitle: {
        color: '#666',
        fontSize: 11,
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 2,
        fontWeight: '700',
        textAlign: 'center'
    },
    controlsSection: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    dpadContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1A1A1A',
        padding: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333'
    },
    dpadRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    centerSpacer: {
        width: 60,
        height: 60,
        backgroundColor: '#111',
        borderRadius: 30,
        margin: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#222'
    },
    controlBtn: {
        width: 60,
        height: 60,
        backgroundColor: '#2A2A2A',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 4,
        borderWidth: 1,
        borderColor: '#333'
    },
    debugSection: {
        flex: 1,
        minHeight: 150,
    },
    logContainer: {
        flex: 1,
        backgroundColor: '#050505',
        borderRadius: 6,
        padding: 12,
        borderWidth: 1,
        borderColor: '#222',
        maxHeight: 200
    },
    logText: {
        color: '#666',
        fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
        fontSize: 11,
        marginBottom: 4,
        lineHeight: 14,
    },
    logError: { color: '#D32F2F' },
    logCmd: { color: '#388E3C' },
    logAI: { color: '#2196F3', fontWeight: 'bold' },
    logNet: { color: '#9C27B0' },
    logSec: { color: '#FF9800', fontWeight: 'bold' },

    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        gap: 8
    },
    actionBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 10,
        letterSpacing: 1
    },
    miniBtn: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 4,
        minWidth: 60,
        alignItems: 'center'
    },
    miniBtnText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold'
    }
});

export default AdminScreen;
