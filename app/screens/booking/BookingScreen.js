import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, StyleSheet } from 'react-native';
import UserWelcome from '../../../components/UserWelcome';
import ActiveBookingsTab from './ActiveBookingsTab';
import BookingHistoryTab from './BookingHistoryTab';

const Tab = createMaterialTopTabNavigator();

const dummyUser = {
  name: null,
  profileImage: null,
};

export default function BookingScreen() {
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
        }}
      >
        <Tab.Screen 
          name="ActiveBookings" 
          component={ActiveBookingsTab}
          options={{
            tabBarLabel: 'Active Bookings'
          }}
        />
        <Tab.Screen 
          name="BookingHistory" 
          component={BookingHistoryTab}
          options={{
            tabBarLabel: 'History'
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

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