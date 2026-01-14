import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RobotActionSimulator = ({ simState }) => {
    // Animations
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // Scale for grid to pixels
    // Let's assume a 5x5 grid view, centered at robot local 0,0, BUT we want to see movement relative to start.
    // Or simpler: Show a fixed frame, and the robot moves inside it. 
    // If simulation moves indefinitely, we might need to clamp or scroll.
    // Let's center the VIEW on the robot, and show a background grid moving?
    // OR simpler: just show robot in center, and metrics.

    // The user wants "Position, Direction, Status" visually.
    // Let's do a Grid Map where the Robot moves around 0,0 center.

    const GRID_SIZE = 40; // Size of one grid cell in pixels

    // Animate Rotation
    useEffect(() => {
        Animated.spring(rotateAnim, {
            toValue: simState.direction,
            useNativeDriver: true,
            friction: 8,
            tension: 20
        }).start();
    }, [simState.direction]);

    // Animate Position
    // We want the robot marker to move relative to the center of the container
    // If x=1, it moves right 40px.
    const transX = useRef(new Animated.Value(0)).current;
    const transY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(transX, {
            toValue: simState.x * GRID_SIZE,
            useNativeDriver: true,
            friction: 9,
        }).start();

        Animated.spring(transY, {
            toValue: -simState.y * GRID_SIZE, // Y is inverted in screen coords (Up is -Y)
            useNativeDriver: true,
            friction: 9,
        }).start();
    }, [simState.x, simState.y]);

    const interpolatedRotate = rotateAnim.interpolate({
        inputRange: [0, 360],
        outputRange: ['0deg', '360deg']
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>VIRTUAL FIELD</Text>

            <View style={styles.mapContainer}>
                {/* Background Grid Lines (Static for reference) */}
                <View style={[styles.gridLine, { top: '50%', width: '100%', height: 1 }]} />
                <View style={[styles.gridLine, { left: '50%', height: '100%', width: 1 }]} />

                {/* Simulated Robot */}
                <Animated.View
                    style={[
                        styles.robotMarker,
                        {
                            transform: [
                                { translateX: transX },
                                { translateY: transY },
                                { rotate: interpolatedRotate }
                            ]
                        }
                    ]}
                >
                    <Ionicons name="navigate" size={32} color="#00E5FF" />
                </Animated.View>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>POS</Text>
                    <Text style={styles.statValue}>X:{simState.x} / Y:{simState.y}</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>HEADING</Text>
                    <Text style={styles.statValue}>{simState.direction}°</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>STATUS</Text>
                    <Text style={[styles.statValue, { color: simState.status === 'IDLE' ? '#888' : '#69F0AE' }]}>
                        {simState.status}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 20,
    },
    title: {
        color: '#666',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 10,
        letterSpacing: 2,
        alignSelf: 'center',
    },
    mapContainer: {
        height: 150,
        backgroundColor: '#111',
        borderRadius: 8,
        marginBottom: 10,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#222'
    },
    gridLine: {
        position: 'absolute',
        backgroundColor: '#333',
    },
    robotMarker: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        // Shadow for glow effect
        shadowColor: "#00E5FF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    stat: {
        alignItems: 'center',
    },
    statLabel: {
        color: '#555',
        fontSize: 10,
        marginBottom: 2,
    },
    statValue: {
        color: '#FFF',
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontWeight: 'bold',
    },
});

export default RobotActionSimulator;
