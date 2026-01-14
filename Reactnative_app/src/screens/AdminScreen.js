import VisionDebugService from '../services/VisionDebugService';

// ... (imports)

const AdminScreen = ({ navigation }) => {
    // ... (existing state)
    const [visionStats, setVisionStats] = useState({
        fps: 0,
        faceDetected: false,
        faceCount: 0,
        confidence: 0,
        identity: 'NONE',
        lastGreeting: 'None'
    });

    useEffect(() => {
        // ... (existing logs listeners)

        // Vision Listener
        const unsubscribeVision = VisionDebugService.addListener((data) => {
            setVisionStats(data);
        });

        return () => {
            // unsubscribeLogs...
            unsubscribeVision();
        };
    }, []);

    // ... (render)

    return (
        <SafeAreaView style={styles.container}>
            {/* ... Header ... */}

            <View style={styles.content}>

                {/* 1. VISION ENGINE DEBUG (NEW) */}
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
                            <Text style={styles.label}>FACES</Text>
                            <Text style={styles.value}>{visionStats.faceCount}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>LAST GREETING</Text>
                            <Text style={[styles.valueCode, { fontSize: 10 }]} numberOfLines={1}>
                                "{visionStats.lastGreeting}"
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 2. NEURAL ENGINE DEBUG (Existing) */}
                {/* ... */}

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
