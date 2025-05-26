import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import UserWelcome from '../../../components/UserWelcome';
import PeopleTab from './PeopleTab';
import GymsTab from './GymsTab';

const dummyUser = {
  name: null,
  profileImage: null,
};

export default function ExploreScreen() {
  const [selectedTab, setSelectedTab] = useState('people');

  return (
    <View style={styles.container}>
      <UserWelcome user={dummyUser} />
      
      {/* Custom toggle tabs with original tab names */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[
            styles.toggleButton, 
            selectedTab === 'people' ? styles.toggleButtonActive : null
          ]}
          onPress={() => setSelectedTab('people')}
        >
          <Text style={[
            styles.toggleText,
            selectedTab === 'people' ? styles.toggleTextActive : null
          ]}>People</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.toggleButton, 
            selectedTab === 'gyms' ? styles.toggleButtonActive : null
          ]}
          onPress={() => setSelectedTab('gyms')}
        >
          <Text style={[
            styles.toggleText,
            selectedTab === 'gyms' ? styles.toggleTextActive : null
          ]}>Gyms</Text>
        </TouchableOpacity>
      </View>
      
      {/* Content based on selected tab */}
      <View style={styles.contentContainer}>
        {selectedTab === 'people' ? (
          <PeopleTab />
        ) : (
          <GymsTab />
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