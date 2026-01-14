import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RobotStatus = ({ batteryLevel, isConnected }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Robot Status</Text>

            <View style={styles.row}>
                <View style={styles.statusItem}>
                    <Ionicons
                        name={isConnected ? "wifi" : "wifi-outline"}
                        size={24}
                        color={isConnected ? "#4CAF50" : "#F44336"}
                    />
                    <Text style={styles.statusText}>
                        {isConnected ? 'Online' : 'Offline'}
                    </Text>
                </View>

                <View style={styles.statusItem}>
                    <Ionicons
                        name="battery-charging"
                        size={24}
                        color={batteryLevel > 20 ? "#4CAF50" : "#FFC107"}
                    />
                    <Text style={styles.statusText}>{batteryLevel}%</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 16,
        borderRadius: 12,
        marginVertical: 10,
        width: '100%',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusText: {
        fontSize: 16,
        color: '#555',
    },
});

export default RobotStatus;
