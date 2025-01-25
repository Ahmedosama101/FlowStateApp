import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from './app/screens/WelcomeScreen';
import SignUpScreen from './app/screens/SignUpScreen';
import GenderScreen from './app/screens/GenderScreen';
import AgeScreen from './app/screens/AgeScreen';
import WeightScreen from './app/screens/WeightScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="WelcomeScreen">
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{ headerShown: false }} />
        <Stack.Screen name="GenderScreen" component={GenderScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AgeScreen" component={AgeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="WeightScreen" component={WeightScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
