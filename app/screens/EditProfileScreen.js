import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { supabase } from '../lib/supabase';

export default function EditProfileScreen({ route, navigation }) {
  const { userData } = route.params;
  const [formData, setFormData] = useState({
    ...userData,
    // Convert age to string if it exists, otherwise use empty string
    age: userData.age ? userData.age.toString() : ''
  });

  const [fontsLoaded] = useFonts({
    'Raleway-Regular': require('../assets/fonts/Raleway-Regular.ttf'),
    'Raleway-Medium': require('../assets/fonts/Raleway-Medium.ttf'),
    'Raleway-Bold': require('../assets/fonts/Raleway-Bold.ttf'),
  });

  const handleSave = async () => {
    try {
      if (!formData.id) {
        throw new Error('User ID is missing');
      }

      // Update user metadata for phone number if it changed
      if (formData.phone_number !== userData.phone_number) {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { phone_number: formData.phone_number }
        });
        if (metadataError) throw metadataError;
      }

      // Update other profile fields
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          // Don't update date_of_birth from age as it requires special handling
          gender: formData.gender,
          weight: formData.weight,
          height: formData.height,
          updated_at: new Date().toISOString()
        })
        .eq('id', formData.id);

      if (profileError) throw profileError;
      
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Update error:', error.message);
      Alert.alert('Error', error.message);
    }
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
          editable={false} // Email should generally not be editable through profile
        />
        <FormField
          label="Age"
          value={formData.age}
          onChangeText={(text) => updateField('age', text)}
          keyboardType="numeric"
          editable={false} // Should not directly edit age as it's calculated from DOB
        />
        <FormField
          label="Gender"
          value={formData.gender}
          onChangeText={(text) => updateField('gender', text)}
        />
        <FormField
          label="Weight (kg)"
          value={formData.weight}
          onChangeText={(text) => updateField('weight', text)}
          keyboardType="numeric"
        />
        <FormField
          label="Height (cm)"
          value={formData.height}
          onChangeText={(text) => updateField('height', text)}
          keyboardType="numeric"
        />
        <FormField
          label="Phone Number"
          value={formData.phone_number}
          onChangeText={(text) => updateField('phone_number', text)}
          keyboardType="phone-pad"
        />
      </View>
    </ScrollView>
  );
}

const FormField = ({ label, value, onChangeText, keyboardType = 'default', editable = true }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, !editable && styles.disabledInput]}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      editable={editable}
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
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#888',
  },
});