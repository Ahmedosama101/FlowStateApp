import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFonts } from 'expo-font';

export default function EditAddressScreen({ route, navigation }) {
  const { addressData } = route.params;
  const [formData, setFormData] = useState(addressData);

  const [fontsLoaded] = useFonts({
    'Raleway-Regular': require('../assets/fonts/Raleway-Regular.ttf'),
    'Raleway-Medium': require('../assets/fonts/Raleway-Medium.ttf'),
    'Raleway-Bold': require('../assets/fonts/Raleway-Bold.ttf'),
  });

  const handleSave = () => {
    // Here you would typically make an API call to update the address data
    console.log('Saving address data:', formData);
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
        <Text style={styles.title}>Edit Address</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <FormField
          label="Street Address"
          value={formData.street}
          onChangeText={(text) => updateField('street', text)}
        />
        <FormField
          label="City"
          value={formData.city}
          onChangeText={(text) => updateField('city', text)}
        />
        <FormField
          label="State"
          value={formData.state}
          onChangeText={(text) => updateField('state', text)}
        />
        <FormField
          label="ZIP Code"
          value={formData.zipCode}
          onChangeText={(text) => updateField('zipCode', text)}
        />
        <FormField
          label="Country"
          value={formData.country}
          onChangeText={(text) => updateField('country', text)}
        />
      </View>
    </ScrollView>
  );
}

const FormField = ({ label, value, onChangeText }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
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