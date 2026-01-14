import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RobotStatus = ({ batteryLevel, isConnected }) => {
    return (
        <View style={styles.container}>
            <View style={styles.technicalHeader}>
                <Ionicons name="hardware-chip-outline" size={14} color="#00E5FF" />
                <Text style={styles.technicalTitle}>SYSTEM TELEMETRY</Text>
                <View style={[styles.signalDot, { backgroundColor: isConnected ? '#00E676' : '#FF5252' }]} />
            </View>

            <View style={styles.row}>
                <View style={styles.statusItem}>
                    <Ionicons
                        name={isConnected ? "pulse" : "alert-circle-outline"}
                        size={20}
                        color={isConnected ? "#00E5FF" : "#FF5252"}
                    />
                    <View>
                        <Text style={styles.label}>ROBOT LINK</Text>
                        <Text style={[styles.statusText, { color: isConnected ? '#FFF' : '#FF5252' }]}>
                            {isConnected ? 'ONLINE' : 'OFFLINE'}
                        </Text>
                    </View>
                </View>

                <View style={styles.statusItem}>
                    <Ionicons
                        name={batteryLevel > 20 ? "battery-full" : "battery-dead"}
                        size={20}
                        color={batteryLevel > 20 ? "#00E676" : "#FF5252"}
                    />
                    <View>
                        <Text style={styles.label}>ENERGY CORE</Text>
                        <Text style={[styles.statusText, { color: '#FFF' }]}>{batteryLevel}%</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1A1A1A',
        padding: 15,
        borderRadius: 12,
        marginVertical: 10,
        width: '100%',
        borderWidth: 1,
        borderColor: '#333',
    },
    technicalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 8
    },
    technicalTitle: {
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        color: '#00E5FF',
        letterSpacing: 1,
        flex: 1
    },
    signalDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    label: {
        fontSize: 9,
        color: '#888',
        fontWeight: 'bold',
        letterSpacing: 0.5
    },
    statusText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
});

export default RobotStatus;
