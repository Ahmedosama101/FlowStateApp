import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MatchesTab from './MatchesTab';
import SessionInviteScreen from './SessionInviteScreen';
import SessionInviteSuccessScreen from './SessionInviteSuccessScreen';
import GymSelection from './GymSelection';
import TimeSelection from './TimeSelection';
import UserDetailsScreen from './UserDetailsScreen';

const Stack = createStackNavigator();

export default function MatchesTabNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AllMatches" component={MatchesTab} />
      <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
      <Stack.Screen name="SessionInvite" component={SessionInviteScreen} />
      <Stack.Screen name="SessionInviteSuccess" component={SessionInviteSuccessScreen} />
      <Stack.Screen name="GymSelection" component={GymSelection} />
      <Stack.Screen name="TimeSelection" component={TimeSelection} />
    </Stack.Navigator>
  );
}