import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RobotService from '../services/RobotService';

const AdminScreen = ({ navigation }) => {
    const [logs, setLogs] = useState([]);
    const [lastVoiceCmd, setLastVoiceCmd] = useState(null);
    const scrollViewRef = useRef();

    useEffect(() => {
        addLog("Admin Console Initialized");

        // Robot Service Listener
        const unsubscribe = RobotService.addListener((data) => {
            // Voice Command Debugging
            if (data.type === 'VOICE_CONTROL') {
                setLastVoiceCmd({
                    raw: data.raw,
                    intent: data.intent || 'UNKNOWN', // intent is passed as command name usually, but we sent it in params too
                    confidence: data.confidence,
                    params: data.parameters,
                    status: 'SUCCESS', // If it reached here via service, it was dispatched
                    timestamp: new Date().toLocaleTimeString()
                });
                addLog(`AI Heard: "${data.raw}"`, 'AI');
            }
            // Connection Status
            else if (data.type === 'CONNECTION') {
                addLog(`Connection: ${data.value ? 'Online' : 'Offline'}`, 'NET');
            }
        });

        return unsubscribe;
    }, []);

    const addLog = (action, type = 'INFO') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] [${type}] ${action}`, ...prev]);
    };

    const handleControl = async (direction) => {
        try {
            await RobotService.sendCommand(direction);
            addLog(`Manual Override: ${direction}`, 'CMD');

            // Clear last voice command on manual override to show we are in manual mode now? 
            // Or keep it for reference. Let's keep it but maybe dim it.
        } catch (e) {
            addLog(`Failed: ${e.message}`, 'ERR');
        }
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

            <View style={styles.content}>

                {/* TOP SECTION: VOICE DEBUG INSPECTOR */}
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
                    {/* LEFT: LOGS (Swapped position for better mobile flow) */}
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
                                    return (
                                        <Text
                                            key={index}
                                            style={[
                                                styles.logText,
                                                isError && styles.logError,
                                                isCmd && styles.logCmd,
                                                isAI && styles.logAI
                                            ]}
                                        >
                                            {log}
                                        </Text>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </View>

                    {/* RIGHT (or Bottom): CONTROLS */}
                    <View style={styles.controlsSection}>
                        <Text style={styles.sectionTitle}>Manual Override</Text>
                        <View style={styles.dpadContainer}>
                            <View style={styles.dpadRow}>
                                <TouchableOpacity
                                    style={styles.controlBtn}
                                    onPress={() => handleControl('FORWARD')}
                                    activeOpacity={0.6}
                                >
                                    <Ionicons name="chevron-up" size={28} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.dpadRow}>
                                <TouchableOpacity
                                    style={styles.controlBtn}
                                    onPress={() => handleControl('LEFT')}
                                    activeOpacity={0.6}
                                >
                                    <Ionicons name="chevron-back" size={28} color="#FFF" />
                                </TouchableOpacity>
                                <View style={styles.centerSpacer}>
                                    <Ionicons name="radio-outline" size={20} color="#555" />
                                </View>
                                <TouchableOpacity
                                    style={styles.controlBtn}
                                    onPress={() => handleControl('RIGHT')}
                                    activeOpacity={0.6}
                                >
                                    <Ionicons name="chevron-forward" size={28} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.dpadRow}>
                                <TouchableOpacity
                                    style={styles.controlBtn}
                                    onPress={() => handleControl('BACKWARD')}
                                    activeOpacity={0.6}
                                >
                                    <Ionicons name="chevron-down" size={28} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                </View>

            </View>
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
        flexDirection: 'column', // Changed to column for mobile stack
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
    logAI: { color: '#2196F3', fontWeight: 'bold' }
});

export default AdminScreen;
