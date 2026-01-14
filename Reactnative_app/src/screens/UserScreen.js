import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, Alert, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

import AuthService from '../services/AuthService';
import VoiceService from '../services/VoiceService';
import RobotService from '../services/RobotService';
import VoiceController from '../controllers/VoiceController';
import ObstacleLogic from '../sensors/ObstacleLogic';

import RobotStatus from '../components/RobotStatus';
import RobotActionSimulator from '../components/RobotActionSimulator';
import PowerManager from '../system/PowerManager';
import RobotFace from '../components/RobotFace';

import { Audio } from 'expo-av';

const UserScreen = ({ navigation }) => {
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    const isFocused = useIsFocused();
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [voiceText, setVoiceText] = useState('');
    const [battery, setBattery] = useState(PowerManager.getStatus().level);
    const [isConnected, setIsConnected] = useState(false);
    const [simState, setSimState] = useState({ status: 'IDLE', x: 0, y: 0, direction: 0 });
    const [robotEmotion, setRobotEmotion] = useState('NEUTRAL');
    const [isRobotSpeaking, setIsRobotSpeaking] = useState(false);

    useEffect(() => {
        // Start Safety Systems
        ObstacleLogic.start();

        // 1. Power Manager (Real Battery)
        const unsubscribePower = PowerManager.addListener((state) => {
            setBattery(state.level);
        });

        // 2. Robot Status Listeners
        const unsubscribeRobot = RobotService.addListener((data) => {
            if (data.type === 'CONNECTION') setIsConnected(data.value);
            if (data.type === 'SIM_STATE') setSimState(data.value);
        });

        // 3. Voice Listeners
        const onSpeechStart = () => setIsListening(true);
        const onSpeechEnd = () => setIsListening(false);
        const onSpeechPartial = (e) => setVoiceText(e.value && e.value.length > 0 ? e.value[0] : '');

        const onSpeechResults = async (e) => {
            setIsListening(false);
            if (e.value && e.value.length > 0) {
                const spokenText = e.value[0];
                setVoiceText(spokenText);
                processCommand(spokenText);
            }
        };

        VoiceService.on('start', onSpeechStart);
        VoiceService.on('end', onSpeechEnd);
        VoiceService.on('partial_result', onSpeechPartial);
        VoiceService.on('final_result', onSpeechResults);

        // Check perms
        checkPermissions();

        return () => {
            ObstacleLogic.stop();
            unsubscribePower();
            unsubscribeRobot();
            VoiceService.off('start', onSpeechStart);
            VoiceService.off('end', onSpeechEnd);
            VoiceService.off('partial_result', onSpeechPartial);
            VoiceService.off('final_result', onSpeechResults);
        };
    }, []);

    // ... render ...
    // Remove Camera View Block


    const checkPermissions = async () => {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Microphone access is required for voice commands.');
        }
    };

    const processCommand = async (text) => {
        setIsProcessing(true);
        try {
            const result = await VoiceController.handleVoiceCommand(text);

            // Success Feedback
            setIsRobotSpeaking(true);
            setRobotEmotion('HAPPY');
            setTimeout(() => {
                setIsRobotSpeaking(false);
                setRobotEmotion('NEUTRAL');
            }, 4000);

        } catch (error) {
            console.error("Command Execution Error:", error);
            setRobotEmotion('SURPRISED');
            setTimeout(() => setRobotEmotion('NEUTRAL'), 2000);
        } finally {
            setIsProcessing(false);
            setTimeout(() => setVoiceText(''), 3000);
        }
    };

    const toggleListening = async () => {
        if (isListening) {
            await VoiceService.stopListening();
        } else {
            setVoiceText('Listening...');
            await VoiceService.startListening();
        }
    };

    const handleAdminAuth = async () => {
        const authenticated = await AuthService.authenticateAdmin();
        if (authenticated) {
            navigation.navigate('Admin');
        } else {
            Alert.alert("Access Denied", "Biometric authentication failed.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {!isLandscape && (
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Robot Controller</Text>
                    <TouchableOpacity style={styles.adminButton} onPress={handleAdminAuth}>
                        <Ionicons name="settings-sharp" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.content}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={isLandscape ? styles.scrollContentLandscape : styles.scrollContentPortrait}
                    showsVerticalScrollIndicator={false}
                    pagingEnabled={isLandscape} // Snap to components in landscape
                >
                    {/* Only show status at top in Portrait */}
                    {!isLandscape && (
                        <View style={styles.statusContainer}>
                            <RobotStatus batteryLevel={battery} isConnected={isConnected} />
                        </View>
                    )}

                    <View style={[styles.faceContainer, isLandscape && { height: height - 10, width: width - 20 }]}>
                        <RobotFace
                            emotion={robotEmotion}
                            isThinking={isProcessing}
                            isSpeaking={isRobotSpeaking}
                        />
                    </View>

                    {/* In Landscape, Show Status/Sim below the face */}
                    {isLandscape && (
                        <View style={styles.landscapeExtraContainer}>
                            <RobotStatus batteryLevel={battery} isConnected={isConnected} />
                            <View style={styles.simContainer}>
                                <RobotActionSimulator simState={simState} />
                            </View>
                        </View>
                    )}

                    {!isLandscape && (
                        <View style={styles.simContainer}>
                            <RobotActionSimulator simState={simState} />
                        </View>
                    )}
                </ScrollView>

                <View style={[styles.bottomControls, isLandscape && styles.bottomControlsLandscape]}>
                    <Text style={[styles.transcriptionText, isLandscape && styles.transcriptionTextLandscape]}>
                        {voiceText || (isListening ? "Listening..." : "Ready")}
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.micButton,
                            isListening && styles.micButtonActive,
                            isProcessing && styles.micButtonProcessing,
                            !isConnected && styles.micButtonDisabled,
                            isLandscape && styles.micButtonLandscape
                        ]}
                        onPress={toggleListening}
                        activeOpacity={0.8}
                        disabled={!isConnected || isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Ionicons
                                name={isListening ? "mic" : "mic-outline"}
                                size={isLandscape ? 32 : 48}
                                color="#FFF"
                            />
                        )}
                    </TouchableOpacity>

                    {isLandscape && (
                        <TouchableOpacity style={styles.landscapeAdminButton} onPress={handleAdminAuth}>
                            <Ionicons name="settings-sharp" size={24} color="#555" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingBottom: 20,
        backgroundColor: '#1F1F1F',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: '700',
    },
    adminButton: {
        padding: 8,
        backgroundColor: '#333',
        borderRadius: 8,
    },
    content: {
        flex: 1,
        padding: 10,
        justifyContent: 'space-between',
    },
    statusContainer: {
        marginBottom: 10,
    },
    simContainer: {
        marginBottom: 10,
    },
    bottomControls: {
        alignItems: 'center',
        paddingBottom: 10,
        backgroundColor: '#121212',
    },
    transcriptionText: {
        color: '#FFF',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '300',
        marginBottom: 15,
        height: 24
    },
    micButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    micButtonActive: {
        backgroundColor: '#FF3B30',
        shadowColor: "#FF3B30",
        transform: [{ scale: 1.1 }],
        borderWidth: 3,
        borderColor: 'rgba(255, 59, 48, 0.3)'
    },
    micButtonProcessing: {
        backgroundColor: '#5856D6',
        shadowColor: "#5856D6",
    },
    micButtonDisabled: {
        backgroundColor: '#333',
        shadowColor: '#000'
    },
    faceContainer: {
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContentPortrait: {
        paddingBottom: 20,
    },
    scrollContentLandscape: {
        paddingBottom: 0,
    },
    landscapeExtraContainer: {
        padding: 20,
    },
    bottomControlsLandscape: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    transcriptionTextLandscape: {
        marginBottom: 0,
        marginRight: 15,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 15,
        borderRadius: 20,
        overflow: 'hidden',
    },
    micButtonLandscape: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    landscapeAdminButton: {
        marginLeft: 15,
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 30,
    }
});

export default UserScreen;
