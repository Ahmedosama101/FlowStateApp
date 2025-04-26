import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import UserWelcome from '../../../components/UserWelcome';
import MatchesTabNavigator from './MatchesTabNavigator';
import MatchInvitesTab from './MatchInvitesTab';
import RequestsTab from './RequestsTab';

const Tab = createMaterialTopTabNavigator();

const dummyUser = {
  name: null,
  profileImage: null,
};

const MatchesScreen = () => {
  return (
    <View style={styles.container}>
      <UserWelcome user={dummyUser} />
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIndicatorStyle: styles.tabIndicator,
          tabBarPressColor: 'transparent',
          swipeEnabled: true,
          animationEnabled: true,
          tabBarActiveTintColor: '#000',
          tabBarInactiveTintColor: '#666',
        }}
      >
        <Tab.Screen 
          name="MatchesList" 
          component={MatchesTabNavigator}
          options={{
            tabBarLabel: 'Matches'
          }}
        />
        <Tab.Screen 
          name="MatchInvites" 
          component={MatchInvitesTab}
          options={{
            tabBarLabel: 'Invites'
          }}
        />
        <Tab.Screen 
          name="SentRequests" 
          component={RequestsTab}
          options={{
            tabBarLabel: 'Requests'
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 35,
  },
  tabBar: {
    backgroundColor: '#fff',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabLabel: {
    textTransform: 'none',
    fontWeight: '600',
    fontSize: 14,
  },
  tabIndicator: {
    backgroundColor: '#007BFF',
    height: 3,
  },
});

export default MatchesScreen;