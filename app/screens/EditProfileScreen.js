import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFonts } from 'expo-font';

export default function EditProfileScreen({ route, navigation }) {
  const { userData } = route.params;
  const [formData, setFormData] = useState(userData);

  const [fontsLoaded] = useFonts({
    'Raleway-Regular': require('../assets/fonts/Raleway-Regular.ttf'),
    'Raleway-Medium': require('../assets/fonts/Raleway-Medium.ttf'),
    'Raleway-Bold': require('../assets/fonts/Raleway-Bold.ttf'),
  });

  const handleSave = () => {
    // Here you would typically make an API call to update the user data
    console.log('Saving user data:', formData);
    // Navigate back after saving
    navigation.goBack();
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <FormField
          label="Full Name"
          value={formData.fullName}
          onChangeText={(text) => updateField('fullName', text)}
        />
        <FormField
          label="Email"
          value={formData.email}
          onChangeText={(text) => updateField('email', text)}
          keyboardType="email-address"
        />
        <FormField
          label="Age"
          value={formData.age.toString()}
          onChangeText={(text) => updateField('age', parseInt(text) || '')}
          keyboardType="numeric"
        />
        <FormField
          label="Gender"
          value={formData.gender}
          onChangeText={(text) => updateField('gender', text)}
        />
        <FormField
          label="Weight"
          value={formData.weight}
          onChangeText={(text) => updateField('weight', text)}
        />
        <FormField
          label="Height"
          value={formData.height}
          onChangeText={(text) => updateField('height', text)}
        />
      </View>
    </ScrollView>
  );
}

const FormField = ({ label, value, onChangeText, keyboardType = 'default' }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Raleway-Bold',
  },
  saveButton: {
    backgroundColor: '#BBD4F9',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    fontFamily: 'Raleway-Medium',
    fontSize: 16,
  },
  form: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Raleway-Medium',
    marginBottom: 8,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Raleway-Regular',
  },
});