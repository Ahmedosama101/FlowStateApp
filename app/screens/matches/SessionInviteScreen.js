import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { supabase } from '../../lib/supabase';

export default function SessionInviteScreen({ navigation, route }) {
  const { partnerId, partnerName, matchRequestId, partnerImage } = route.params;
  const [selectedGym, setSelectedGym] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check and refresh session when component mounts
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Session refresh error:', error);
          navigation.navigate('Login');
          return;
        }
        console.log('Session refreshed:', session?.user?.id);
      } catch (error) {
        console.error('Session check error:', error);
      }
    };
    
    checkSession();
  }, []);

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

  const formatDateForDatabase = (dateString) => {
    try {
      const parts = dateString.split(' ');
      const months = {
        Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
        Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
      };
      return `${parts[3]}-${months[parts[1]]}-${parts[2].padStart(2, '0')}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return null;
    }
  };

  const handleSendInvite = async () => {
    if (!selectedGym || !selectedDateTime) {
      Alert.alert('Incomplete Selection', 'Please select both gym and time');
      return;
    }

    if (!partnerId) {
      console.error('No partnerId available');
      Alert.alert('Error', 'Cannot send invite: missing partner information');
      return;
    }

    try {
      setLoading(true);
      
      // First refresh the session
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError) {
        throw new Error('Session invalid. Please login again.');
      }

      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const formattedDate = formatDateForDatabase(selectedDateTime.date);
      if (!formattedDate) {
        throw new Error('Invalid date format');
      }

      // Determine time slot based on the hour
      const hour = parseInt(selectedDateTime.time.split(':')[0]);
      let timeSlot = 'morning';
      if (hour >= 12 && hour < 17) {
        timeSlot = 'afternoon';
      } else if (hour >= 17) {
        timeSlot = 'evening';
      }

      const formattedTime = selectedDateTime.time + ':00';

      console.log('Creating invite with partnerId:', partnerId);

      const newInvite = {
        sender_id: session.user.id,
        receiver_id: partnerId,
        gym_id: selectedGym.id,
        booking_date: formattedDate,
        specific_time: formattedTime,
        time_slot: timeSlot,
        status: 'pending',
        notes: `Training session with ${partnerName} at ${selectedGym.name}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Sending booking invite:', newInvite);

      // Insert the booking invite without trying to select relationships
      const { error } = await supabase
        .from('booking_invites')
        .insert([newInvite]);

      if (error) {
        console.error('Database error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          insert_data: newInvite
        });
        throw error;
      }

      // Navigate to success screen
      navigation.navigate('SessionInviteSuccess');
      
      // Reset navigation to main screen after a delay
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTab' }],
        });
      }, 2000);

    } catch (error) {
      console.error('Error sending invite:', error);
      Alert.alert('Error', 'Failed to send invite: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session invite</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.userCard}>
          <Image 
            source={{ uri: partnerImage || 'https://via.placeholder.com/150' }} 
            style={styles.userImage} 
          />
          <Text style={styles.userName}>{partnerName || 'Partner'}</Text>
        </View>

        <TouchableOpacity
          style={styles.inputField}
          onPress={handleGymSelection}
          disabled={loading}
        >
          <Text style={[styles.inputText, !selectedGym && styles.placeholderText]}>
            {selectedGym ? selectedGym.name : 'Where'}
          </Text>
          <Icon name="chevron-right" size={16} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.inputField, !selectedGym && styles.disabledInput]}
          onPress={handleTimeSelection}
          disabled={!selectedGym || loading}
        >
          <Text style={[styles.inputText, !selectedDateTime && styles.placeholderText]}>
            {selectedDateTime
              ? `${selectedDateTime.date} at ${selectedDateTime.time}`
              : 'When'}
          </Text>
          <Icon name="chevron-right" size={16} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!selectedGym || !selectedDateTime || loading) && styles.disabledButton
          ]}
          onPress={handleSendInvite}
          disabled={!selectedGym || !selectedDateTime || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Send Invite</Text>
          )}
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
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Raleway-Bold',
    color: '#1E3A8A',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // To offset the back button and center the title
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Raleway-Bold',
    color: '#1E3A8A',
  },
  inputField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputText: {
    fontSize: 16,
    fontFamily: 'Raleway-Medium',
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  disabledInput: {
    opacity: 0.7,
  },
  disabledButton: {
    opacity: 0.5,
  },
  sendButton: {
    backgroundColor: '#1E3A8A',
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