import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Or any other icon library
import { useFonts } from 'expo-font';

export default function GenderSelectionScreen ({navigation}) {
  const [selectedGender, setSelectedGender] = useState(null);

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
  };
 const [fontsLoaded] = useFonts({
    'Raleway-Regular': require('../assets/fonts/Raleway-Regular.ttf'),
    'Raleway-Medium': require('../assets/fonts/Raleway-Medium.ttf'),
    'Raleway-Bold': require('../assets/fonts/Raleway-Bold.ttf'),
  });
  const handleContinue = () => {
    if (selectedGender) {
     navigation.navigate('AgeScreen')
      // Navigate to the next screen or perform other actions
    } else {
      alert('Please select a gender.'); // Or a better way to display an error
    }
  };

  return (
    <View style={styles.container}>
    <Text style={styles.title}>What's Your Gender</Text>

    {/* Wrap each gender option in a View */}
    <View style={styles.genderOptionContainer}>
      <TouchableOpacity
        style={[styles.genderButton, selectedGender === 'male' && styles.selectedGender]}
        onPress={() => handleGenderSelect('male')}
      >
        <Icon name="mars" size={80} color="#363f3b" />
      </TouchableOpacity>
      <Text style={styles.genderText}>Male</Text>
    </View>

    <View style={styles.genderOptionContainer}>
      <TouchableOpacity
        style={[styles.genderButton, selectedGender === 'female' && styles.selectedGender]}
        onPress={() => handleGenderSelect('female')}
      >
        <Icon name="venus" size={80} color="#363f3b" />
      </TouchableOpacity>
      <Text style={styles.genderText}>Female</Text>
    </View>

    <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
      <Text style={styles.continueButtonText}>Continue</Text>
    </TouchableOpacity>
  </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
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
    elevation: 3, // Add shadow (Android)
    shadowColor: '#000', // Add shadow (iOS)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  selectedGender: {
    backgroundColor: '#BBD4F9', // Slightly darker background when selected
  },
  genderText: {
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    marginBottom:10,
  },
  continueButton: {
    marginTop: 40,
    backgroundColor: '#eee',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
  },
  continueButtonText: {
    fontSize: 18,
    fontFamily: 'Raleway-Bold',
  },
  genderOptionContainer: { // New style for containing gender elements
    alignItems: 'center', // Center items horizontally
    marginBottom:20, // Add spacing between gender options
  },
});

