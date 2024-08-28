//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/Auth/LoginScreen';
import Product from './src/Main/Order/Order';
import Splash from './src/Auth/Splash';
import Cancle_Order from './src/Main/Order/CancleOrder';
import Complete_Order from './src/Main/Order/CompleteOrder';
import Footer from './src/Main/Order/footer';
import History from './src/Main/Order/History';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Splash" component={Splash} options={
          headerShown = {
            headerShown: false
          }
        } />
        <Stack.Screen name="Login" component={LoginScreen} options={
          headerShown = {
            headerShown: false
          }
        } />
        <Stack.Screen name="History" component={History}
          options={
            headerShown = {
              headerShown: false
            }
          } />
        <Stack.Screen name="Order" component={Product}
          options={
            headerShown = {
              headerShown: false
            }
          } />
        <Stack.Screen name="Cancle Order" component={Cancle_Order}
          options={
            headerShown = {
              headerShown: false
            }
          } />
        <Stack.Screen name="Complete Order" component={Complete_Order}
          options={
            headerShown = {
              headerShown: false
            }
          } />
        <Stack.Screen name="Footer" component={Footer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
});

//make this component available to the app
export default App;
