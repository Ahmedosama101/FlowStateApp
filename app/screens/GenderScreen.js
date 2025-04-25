import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { supabase } from '../lib/supabase';

export default function GenderSelectionScreen({navigation}) {
  const [selectedGender, setSelectedGender] = useState(null);
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    'Raleway-Regular': require('../assets/fonts/Raleway-Regular.ttf'),
    'Raleway-Medium': require('../assets/fonts/Raleway-Medium.ttf'),
    'Raleway-Bold': require('../assets/fonts/Raleway-Bold.ttf'),
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigation.navigate('Auth');
        return;
      }

      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('gender')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        return;
      }

      if (existingProfile) {
        setSelectedGender(existingProfile.gender || null);
      }

    } catch (error) {
      console.error('Error loading user data:', error.message);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
  };

  const handleContinue = async () => {
    if (!selectedGender) {
      Alert.alert('Error', 'Please select your gender.');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigation.navigate('Auth');
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          gender: selectedGender,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (updateError) throw updateError;
      
      navigation.navigate('DateOfBirth');
    } catch (error) {
      console.error('Error saving data:', error.message);
      Alert.alert('Error', 'Failed to save your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's Your Gender</Text>

      <View style={styles.genderOptionContainer}>
        <TouchableOpacity
          style={[styles.genderButton, selectedGender === 'male' && styles.selectedGender]}
          onPress={() => handleGenderSelect('male')}
          disabled={loading}
        >
          <Icon name="mars" size={80} color="#363f3b" />
        </TouchableOpacity>
        <Text style={styles.genderText}>Male</Text>
      </View>

      <View style={styles.genderOptionContainer}>
        <TouchableOpacity
          style={[styles.genderButton, selectedGender === 'female' && styles.selectedGender]}
          onPress={() => handleGenderSelect('female')}
          disabled={loading}
        >
          <Icon name="venus" size={80} color="#363f3b" />
        </TouchableOpacity>
        <Text style={styles.genderText}>Female</Text>
      </View>

      <TouchableOpacity 
        style={[
          styles.continueButton,
          (!selectedGender || loading) && styles.disabledButton
        ]} 
        onPress={handleContinue}
        disabled={!selectedGender || loading}
      >
        <Text style={styles.continueButtonText}>
          {loading ? 'Saving...' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Raleway-Bold',
    marginBottom: 40,
  },
  genderButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  selectedGender: {
    backgroundColor: '#BBD4F9',
  },
  genderText: {
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    marginBottom: 10,
  },
  continueButton: {
    marginTop: 30,
    backgroundColor: '#000',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 18,
    fontFamily: 'Raleway-Bold',
    color: '#fff',
  },
  genderOptionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  }
});

