import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { supabase } from '../../lib/supabase';

export default function SessionInviteScreen({ navigation, route }) {
  const { partnerId, partnerName, matchRequestId } = route.params;
  const [selectedGym, setSelectedGym] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  const handleGymSelection = () => {
    navigation.navigate('GymSelection', {
      onSelect: (gym) => {
        setSelectedGym(gym);
        navigation.goBack();
      }
    });
  };

  const handleTimeSelection = () => {
    if (!selectedGym) {
      Alert.alert('Select Gym', 'Please select a gym first');
      return;
    }
    navigation.navigate('TimeSelection', {
      selectedGym,
      onSelect: (dateTime) => {
        setSelectedDateTime(dateTime);
        navigation.goBack();
      }
    });
  };

  const handleSendInvite = async () => {
    if (!selectedGym || !selectedDateTime) {
      Alert.alert('Incomplete Selection', 'Please select both gym and time');
      return;
    }

    try {
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession?.session?.user) {
        Alert.alert('Error', 'Please login to send invites');
        return;
      }

      const { error } = await supabase.from('session_invites').insert({
        sender_id: userSession.session.user.id,
        receiver_id: partnerId,
        gym_id: selectedGym.id,
        gym_name: selectedGym.name,
        date: selectedDateTime.date,
        time: selectedDateTime.time,
        status: 'pending'
      });

      if (error) throw error;

      Alert.alert(
        'Success',
        'Training session invite sent successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error sending invite:', error);
      Alert.alert('Error', 'Failed to send invite. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Session</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Training with {partnerName}</Text>
        </View>

        <TouchableOpacity
          style={styles.selectionButton}
          onPress={handleGymSelection}
        >
          <View style={styles.selectionContent}>
            <Icon name="map-marker" size={24} color="#007BFF" />
            <View style={styles.selectionTextContainer}>
              <Text style={styles.selectionLabel}>Gym</Text>
              <Text style={styles.selectionValue}>
                {selectedGym ? selectedGym.name : 'Select a gym'}
              </Text>
            </View>
            <Icon name="chevron-right" size={16} color="#666" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.selectionButton,
            !selectedGym && styles.disabledButton
          ]}
          onPress={handleTimeSelection}
          disabled={!selectedGym}
        >
          <View style={styles.selectionContent}>
            <Icon name="clock-o" size={24} color="#007BFF" />
            <View style={styles.selectionTextContainer}>
              <Text style={styles.selectionLabel}>Date & Time</Text>
              <Text style={styles.selectionValue}>
                {selectedDateTime
                  ? `${selectedDateTime.date} at ${selectedDateTime.time}`
                  : 'Select date and time'}
              </Text>
            </View>
            <Icon name="chevron-right" size={16} color="#666" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!selectedGym || !selectedDateTime) && styles.disabledButton
          ]}
          onPress={handleSendInvite}
          disabled={!selectedGym || !selectedDateTime}
        >
          <Text style={styles.sendButtonText}>Send Invite</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Raleway-Bold',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userInfo: {
    marginBottom: 32,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Raleway-Bold',
  },
  selectionButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionTextContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  selectionLabel: {
    fontSize: 14,
    fontFamily: 'Raleway-Regular',
    color: '#666',
    marginBottom: 4,
  },
  selectionValue: {
    fontSize: 16,
    fontFamily: 'Raleway-Medium',
    color: '#333',
  },
  disabledButton: {
    opacity: 0.5,
  },
  sendButton: {
    backgroundColor: '#007BFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
  },
});