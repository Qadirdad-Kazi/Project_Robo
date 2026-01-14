import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RobotStatus from '../components/RobotStatus';
import RobotActionSimulator from '../components/RobotActionSimulator';
import RobotService from '../services/RobotService';
import VoiceService from '../services/VoiceService';
import { handleVoiceCommand } from '../controllers/VoiceController';
import Toast from 'react-native-toast-message';
import AuthService from '../services/AuthService';
import { Audio } from 'expo-av';

const UserScreen = ({ navigation }) => {
    const [isListening, setIsListening] = useState(false);
    const [voiceText, setVoiceText] = useState('');
    const [battery, setBattery] = useState(85);
    const [isConnected, setIsConnected] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [simState, setSimState] = useState({ x: 0, y: 0, direction: 0, status: 'IDLE' });

    useEffect(() => {
        // Request Mic Permissions on Mount
        (async () => {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Required", "Microphone access is needed for voice commands.");
            }
        })();

        // Robot Status Listeners
        const status = RobotService.getStatus();
        setBattery(status.batteryLevel);
        setIsConnected(status.isConnected);
        if (status.simState) setSimState(status.simState);

        const unsubscribeRobot = RobotService.addListener((data) => {
            if (data.type === 'BATTERY') setBattery(data.value);
            if (data.type === 'CONNECTION') {
                setIsConnected(data.value);
            }
            if (data.type === 'SIM_STATE') {
                setSimState(data.value);
            }
        });

        // Voice Listeners
        VoiceService.setListeners({
            onStart: () => {
                setIsListening(true);
                setVoiceText('');
            },
            onEnd: () => {
                setIsListening(false);
            },
            onPartialResults: (results) => {
                if (results && results.length > 0) {
                    setVoiceText(results[0]);
                }
            },
            onResults: async (results) => {
                setIsListening(false);
                if (results && results.length > 0) {
                    const finalCommand = results[0];
                    setVoiceText(finalCommand);
                    await processCommand(finalCommand);
                }
            },
            onError: (e) => {
                setIsListening(false);
                // console.log("Voice Error", e);
            }
        });

        return () => {
            unsubscribeRobot();
            VoiceService.cancelListening();
        };
    }, []);

    const handleAdminAuth = async () => {
        const authorized = await AuthService.authenticateAdmin();
        if (authorized) {
            navigation.navigate('Admin');
        } else {
            // Toast or Alert handled by Service fallback or just silence
        }
    };

    const toggleListening = async () => {
        if (isListening) {
            await VoiceService.stopListening();
        } else {
            await VoiceService.startListening();
        }
    };

    const processCommand = async (text) => {
        setIsProcessing(true);

        const result = await handleVoiceCommand(text);

        setIsProcessing(false);

        if (result.type === 'SUCCESS') {
            VoiceService.speak(result.response);
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: result.response,
                visibilityTime: 2000
            });
        } else {
            VoiceService.speak("I didn't quite get that.");
            Toast.show({
                type: 'error',
                text1: 'Unknown Command',
                text2: "Try 'Move forward' or 'Dance'",
                visibilityTime: 3000
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Robot Controller</Text>
                <TouchableOpacity
                    style={styles.adminButton}
                    onPress={handleAdminAuth}
                >
                    <Ionicons name="settings-sharp" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>

                <View style={styles.statusContainer}>
                    <RobotStatus batteryLevel={battery} isConnected={isConnected} />
                    <RobotActionSimulator simState={simState} />
                </View>

                {/* Voice Feedback Area */}
                <View style={styles.feedbackContainer}>
                    <Text style={styles.feedbackLabel}>
                        {isListening ? "Listening..." : (isProcessing ? "Processing..." : "Ready")}
                    </Text>
                    <Text style={styles.transcriptionText}>
                        {voiceText || "Press mic to speak"}
                    </Text>
                </View>

                <View style={styles.micContainer}>
                    <TouchableOpacity
                        style={[
                            styles.micButton,
                            isListening && styles.micButtonActive,
                            isProcessing && styles.micButtonProcessing,
                            !isConnected && styles.micButtonDisabled
                        ]}
                        onPress={toggleListening}
                        activeOpacity={0.8}
                        disabled={!isConnected || isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator size="large" color="#FFF" />
                        ) : (
                            <Ionicons
                                name={isListening ? "mic" : "mic-outline"}
                                size={64}
                                color="#FFF"
                            />
                        )}
                    </TouchableOpacity>
                    <Text style={styles.micLabel}>
                        {!isConnected ? "Offline" : (isListening ? "Tap to Stop" : "Tap to Speak")}
                    </Text>
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
        padding: 20,
        justifyContent: 'space-between',
    },
    statusContainer: {
        marginBottom: 20,
    },
    feedbackContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    feedbackLabel: {
        color: '#007AFF',
        fontSize: 16,
        marginBottom: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    transcriptionText: {
        color: '#FFF',
        fontSize: 28,
        textAlign: 'center',
        fontWeight: '300',
        opacity: 0.9
    },
    micContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    micButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 20,
    },
    micButtonActive: {
        backgroundColor: '#FF3B30',
        shadowColor: "#FF3B30",
        transform: [{ scale: 1.1 }],
        borderWidth: 4,
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
    micLabel: {
        color: '#AAA',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default UserScreen;
