// Import libraries
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const calculateHeightPercentage = percentage => {
    return (windowHeight * percentage) / 100;
};

const calculateWidthPercentage = percentage => {
    return (windowWidth * percentage) / 100;
};

const calculateFontSizePercentage = percentage => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};

// Create the Splash component
const Splash = ({ navigation }) => {

    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        const timer = setTimeout(async() => {
            const token = await AsyncStorage.getItem("LoginData")
            if (token) {
                navigation.navigate('Order');
            }
            else {
                navigation.navigate('Login');
            }
        }, 2500);

        return () => clearTimeout(timer);
    }, [navigation]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start();
    }, [opacity, translateY]);

    return (
        <View style={styles.container}>
            <LottieView
                source={require('../../assets/Logo.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
            />
            <Animated.Text
                style={[
                    styles.animatedText,
                    {
                        opacity: opacity,
                        transform: [{ translateY: translateY }],
                    },
                ]}
            >
                Deliver & Service's!
            </Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    lottieAnimation: {
        marginTop: calculateHeightPercentage(-15),
        height: calculateHeightPercentage(50),
        width: calculateWidthPercentage(100),
    },
    animatedText: {
        fontSize: 24,
        textAlign: 'center',
        marginTop: -25,
        color: 'black'
    },
});

// Make this component available to the app
export default Splash;
