import CameraViewComponent from '../camera/CameraView';

// ... (existing imports)

const UserScreen = ({ navigation }) => {
    // ... (existing state)
    const [isCameraActive, setIsCameraActive] = useState(true);

    // ... (existing functions)

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

                {/* Scrollable Content for small screens */}
                <View style={{ flex: 1 }}>
                    <View style={styles.statusContainer}>
                        <RobotStatus batteryLevel={battery} isConnected={isConnected} />
                    </View>

                    {/* Camera Feed */}
                    <View style={styles.cameraContainer}>
                        {isCameraActive && (
                            <CameraViewComponent
                                showFps={false}
                                onFrame={(photo) => console.log("Frame captured", photo.uri)}
                            />
                        )}
                    </View>

                    {/* Robot Sim - Made smaller or collapsible? Keeping as is for now */}
                    <View style={styles.simContainer}>
                        <RobotActionSimulator simState={simState} />
                    </View>
                </View>

                {/* Bottom Controls (Fixed) */}
                <View style={styles.bottomControls}>
                    {/* Voice Feedback Area merged here to save space */}
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
    // ... (keep existing container/header)
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
        height: 240, // Fixed height for camera
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 10,
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#333'
    },
    simContainer: {
        marginBottom: 10,
        // Make sim slightly more compact if needed
    },
    bottomControls: {
        alignItems: 'center',
        paddingBottom: 10,
        backgroundColor: '#121212', // Opaque bg to cover scroll
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
        width: 80, // Smaller mic button to fit everything
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
});

export default UserScreen;
