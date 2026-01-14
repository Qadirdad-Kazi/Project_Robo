import PowerManager from '../system/PowerManager';
import RobotFace from '../components/RobotFace';

// ... other imports ...

const UserScreen = ({ navigation }) => {
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

        // ... Voice Listeners ...

        return () => {
            ObstacleLogic.stop();
            unsubscribePower();
            unsubscribeRobot();
            // ...
        }
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
        const result = await VoiceController.handleVoiceCommand(text);
        setIsProcessing(false);

        // Simple heuristic: If result has an AI answer or successful command, assume speaking for a few seconds
        // In a real app, VoiceService would emit 'tts_start' and 'tts_finish'
        setIsRobotSpeaking(true);
        setRobotEmotion('HAPPY'); // React positively
        setTimeout(() => {
            setIsRobotSpeaking(false);
            setRobotEmotion('NEUTRAL');
        }, 4000); // Fake talking duration

        setTimeout(() => setVoiceText(''), 3000);
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
                <View style={{ flex: 1 }}>
                    <View style={styles.statusContainer}>
                        <RobotStatus batteryLevel={battery} isConnected={isConnected} />
                    </View>

                    <View style={styles.faceContainer}>
                        <RobotFace
                            emotion={robotEmotion}
                            isThinking={isProcessing}
                            isSpeaking={isRobotSpeaking} // Would need TTS listener for true speaking state
                        />
                    </View>

                    {/* Simulator Mini View */}
                    <View style={styles.simContainer}>
                        <RobotActionSimulator simState={simState} />
                    </View>
                </View>

                <View style={styles.bottomControls}>
                    <Text style={styles.transcriptionText}>
                        {voiceText || (isListening ? "Listening..." : "Ready")}
                    </Text>

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
                                size={48}
                                color="#FFF"
                            />
                        )}
                    </TouchableOpacity>
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
    cameraContainer: {
        height: 240,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 10,
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#333'
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
    }
});

export default UserScreen;
