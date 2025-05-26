import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import UserWelcome from '../../../components/UserWelcome';
import ActiveBookingsTab from './ActiveBookingsTab';
import BookingInvitesTab from './BookingInvitesTab';
import BookingHistoryTab from './BookingHistoryTab';

const dummyUser = {
  name: null,
  profileImage: null,
};

export default function BookingScreen() {
  const [selectedTab, setSelectedTab] = useState('active');

  return (
    <View style={styles.container}>
      <UserWelcome user={dummyUser} />
      
      {/* Custom toggle tabs with original tab names */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[
            styles.toggleButton, 
            selectedTab === 'active' ? styles.toggleButtonActive : null
          ]}
          onPress={() => setSelectedTab('active')}
        >
          <Text style={[
            styles.toggleText,
            selectedTab === 'active' ? styles.toggleTextActive : null
          ]}>Active</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.toggleButton, 
            selectedTab === 'invites' ? styles.toggleButtonActive : null
          ]}
          onPress={() => setSelectedTab('invites')}
        >
          <Text style={[
            styles.toggleText,
            selectedTab === 'invites' ? styles.toggleTextActive : null
          ]}>Invites</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.toggleButton, 
            selectedTab === 'history' ? styles.toggleButtonActive : null
          ]}
          onPress={() => setSelectedTab('history')}
        >
          <Text style={[
            styles.toggleText,
            selectedTab === 'history' ? styles.toggleTextActive : null
          ]}>History</Text>
        </TouchableOpacity>
      </View>
      
      {/* Content based on selected tab */}
      <View style={styles.contentContainer}>
        {selectedTab === 'active' ? (
          <ActiveBookingsTab />
        ) : selectedTab === 'invites' ? (
          <BookingInvitesTab />
        ) : (
          <BookingHistoryTab />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 35,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    margin: 15,
    padding: 5,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
});