import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import UserWelcome from '../../../components/UserWelcome';
import MatchesTabNavigator from './MatchesTabNavigator';
import MatchInvitesTab from './MatchInvitesTab';
import RequestsTab from './RequestsTab';

const dummyUser = {
  name: null,
  profileImage: null,
};

const MatchesScreen = () => {
  const [selectedTab, setSelectedTab] = useState('matches');

  return (
    <View style={styles.container}>
      <UserWelcome user={dummyUser} />
      
      {/* Custom toggle tabs with original tab names */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[
            styles.toggleButton, 
            selectedTab === 'matches' ? styles.toggleButtonActive : null
          ]}
          onPress={() => setSelectedTab('matches')}
        >
          <Text style={[
            styles.toggleText,
            selectedTab === 'matches' ? styles.toggleTextActive : null
          ]}>Matches</Text>
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
            selectedTab === 'requests' ? styles.toggleButtonActive : null
          ]}
          onPress={() => setSelectedTab('requests')}
        >
          <Text style={[
            styles.toggleText,
            selectedTab === 'requests' ? styles.toggleTextActive : null
          ]}>Requests</Text>
        </TouchableOpacity>
      </View>
      
      {/* Content based on selected tab */}
      <View style={styles.contentContainer}>
        {selectedTab === 'matches' ? (
          <MatchesTabNavigator />
        ) : selectedTab === 'invites' ? (
          <MatchInvitesTab />
        ) : (
          <RequestsTab />
        )}
      </View>
    </View>
  );
};

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

export default MatchesScreen;