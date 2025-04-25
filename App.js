import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthNavigator from './app/navigation/AuthNavigator';
import MainNavigator from './app/navigation/MainNavigator';
import GenderScreen from './app/screens/GenderScreen';
import DateOfBirthScreen from './app/screens/DateOfBirthScreen';
import WeightScreen from './app/screens/WeightScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="Gender" component={GenderScreen} />
          <Stack.Screen name="DateOfBirth" component={DateOfBirthScreen} />
          <Stack.Screen name="Weight" component={WeightScreen} />
          <Stack.Screen name="Main" component={MainNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
