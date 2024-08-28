//import liraries
import React, { Component, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { CustomerApi, CustomerBaseUrl } from '../../Config/BaseUtil';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

// Helper functions for dimension calculations
const calculateHeightPercentage = percentage => (windowHeight * percentage) / 100;
const calculateWidthPercentage = percentage => (windowWidth * percentage) / 100;
const calculateFontSizePercentage = percentage => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};

// create a component
const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [IsSecureEntry, setIsSecureEntery] = useState(true)

    const handleLogin = async () => {
        console.log("first :- ",email)
        console.log("first :- ",password)
        // salesone@gmail.com  123456
        await axios.post(`${CustomerBaseUrl}user/signin`,
            {
                "email": email,
                "password": password
            },
        )
            .then(async(res) => {
                console.log("Response data:", res?.data?.user);
                if (res?.data?.user?.rolename?.roleName == "Delivery Boy") {
                    await AsyncStorage.setItem('LoginData',JSON.stringify(res?.data?.user));
                    navigation.navigate("Order")
                }
            })
            .catch((err) => {
                console.log(err.response.data.message);
                Alert.alert(err.response.data.message)
            })
    }

    return (
        <SafeAreaView style={styles.container}>
            <View>
                <Image
                    source={require("../../assets/Logo.png")}
                    style={{
                        height: calculateHeightPercentage(20),
                        width: calculateWidthPercentage(70),
                        resizeMode: 'contain',
                    }}
                />
                <Text style={{ fontSize: calculateFontSizePercentage(7), fontWeight: 'bold', alignSelf: 'center', color: 'black' }}>Login</Text>
            </View>
            <ScrollView >
                <View style={{ marginTop: calculateHeightPercentage(1), width: calculateWidthPercentage(85) }}>

                    <Text style={{ fontSize: calculateFontSizePercentage(4), paddingVertical: calculateHeightPercentage(1), color: 'gray' }}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your Email"
                        placeholderTextColor={'gray'}
                        onChangeText={text => setEmail(text)}
                        value={email}
                        keyboardType='email-address'
                    />
                    <Text style={{ fontSize: calculateFontSizePercentage(4), paddingVertical: calculateHeightPercentage(1), color: 'gray' }}>Password</Text>
                    <View style={styles.input}>
                        <TextInput
                            style={{ width: '90%',color:'black' }}
                            placeholderTextColor={'gray'}
                            placeholder="Enter your Password"
                            onChangeText={text => setPassword(text)}
                            value={password}
                            secureTextEntry={IsSecureEntry}
                        />
                        <TouchableOpacity
                            style={{
                                width: calculateWidthPercentage(20)
                            }}
                            onPress={() => {
                                setIsSecureEntery(!IsSecureEntry)
                            }}>
                            <Icon name={IsSecureEntry === false ? 'eye' : 'eye-off'} size={23} color='black' />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={handleLogin} style={styles.button}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        marginTop: calculateHeightPercentage(12),
        alignItems: 'center',
    },
    input: {
        color:'black',
        paddingHorizontal: calculateWidthPercentage(5),
        flexDirection: 'row',
        height: calculateHeightPercentage(6),
        borderColor: 'black',
        borderRadius: calculateFontSizePercentage(1.5),
        alignItems: 'center',
        backgroundColor: "#f0f0f0",
        borderColor: '#e0e0e5',
        borderWidth: 1,
        elevation: 5,
        marginBottom: calculateHeightPercentage(2),
    },
    button: {
        backgroundColor: '#EAAA13',
        paddingVertical: 10,
        marginTop: calculateHeightPercentage(1),
        borderRadius: 10
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
    },
});

//make this component available to the app
export default LoginScreen;
