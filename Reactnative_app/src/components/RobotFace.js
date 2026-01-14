import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const RobotFace = ({ emotion = 'NEUTRAL', isSpeaking = false, isThinking = false }) => {
    // Animation Values
    const blinkAnim = useRef(new Animated.Value(1)).current; // Eyes Open (ScaleY)
    const mouthWidth = useRef(new Animated.Value(100)).current;
    const eyeHeight = useRef(new Animated.Value(50)).current;

    // Blink Logic
    useEffect(() => {
        const loop = () => {
            // Random Blink Interval
            const nextBlink = Math.random() * 3000 + 1000;
            setTimeout(() => {
                Animated.sequence([
                    Animated.timing(blinkAnim, { toValue: 0.1, duration: 100, useNativeDriver: false }),
                    Animated.timing(blinkAnim, { toValue: 1, duration: 100, useNativeDriver: false })
                ]).start(() => loop());
            }, nextBlink);
        };
        loop();
        return () => { }; // Cleanup not really needed for loop unless we stored timeout ID
    }, []);

    // Emotion Logic
    useEffect(() => {
        let targetMouth = 100;
        let targetEye = 50;

        switch (emotion) {
            case 'HAPPY':
                targetMouth = 150; // Wide Smile
                targetEye = 50;
                break;
            case 'SAD':
                targetMouth = 50; // Small
                targetEye = 40; // Droopy
                break;
            case 'SURPRISED':
                targetMouth = 50; // O face
                targetEye = 80; // Wide eyes
                break;
            case 'ANGRY':
                targetMouth = 100;
                targetEye = 30; // Narrow eyes
                break;
            default:
                targetMouth = 100;
                targetEye = 50;
        }

        Animated.parallel([
            Animated.timing(mouthWidth, { toValue: targetMouth, duration: 500, useNativeDriver: false }),
            Animated.timing(eyeHeight, { toValue: targetEye, duration: 500, useNativeDriver: false })
        ]).start();

    }, [emotion]);

    // Thinking Animation (Rotate/Pulse Eyes?)
    // For now simple look:
    const eyeColor = isThinking ? '#00E5FF' : isSpeaking ? '#00E676' : '#FFF';
    const mouthColor = isSpeaking ? '#FFF' : '#AAA';

    return (
        <View style={styles.container}>
            {/* EYES */}
            <View style={styles.eyesContainer}>
                <Animated.View style={[styles.eye, {
                    height: eyeHeight,
                    transform: [{ scaleY: blinkAnim }],
                    backgroundColor: eyeColor
                }]} />
                <Animated.View style={[styles.eye, {
                    height: eyeHeight,
                    transform: [{ scaleY: blinkAnim }],
                    backgroundColor: eyeColor
                }]} />
            </View>

            {/* MOUTH */}
            <View style={styles.mouthContainer}>
                <Animated.View style={[
                    styles.mouth,
                    { width: mouthWidth, backgroundColor: mouthColor },
                    isSpeaking && styles.talkingMouth // Simple CSS hack for talking
                ]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 250,
        backgroundColor: '#000',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#333'
    },
    eyesContainer: {
        flexDirection: 'row',
        gap: 60,
        marginBottom: 50
    },
    eye: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF',
        shadowColor: "#FFF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
    },
    mouthContainer: {
        height: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    mouth: {
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FFF'
    },
    talkingMouth: {
        height: 20, // Should animate height for talking properly, but this is a placeholder
    }
});

export default RobotFace;
