import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFonts } from 'expo-font';

export default function ProfileScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    'Raleway-Regular': require('../assets/fonts/Raleway-Regular.ttf'),
    'Raleway-Medium': require('../assets/fonts/Raleway-Medium.ttf'),
    'Raleway-Bold': require('../assets/fonts/Raleway-Bold.ttf'),
  });

  // Mock user data - replace with actual user data from your backend
  const userData = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    age: 28,
    gender: 'Male',
    weight: '75 KG',
    height: '175 cm',
  };

  const addressData = {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile', { userData })}
        >
          <Icon name="edit" size={20} color="#000" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoContainer}>
          <InfoItem label="Full Name" value={userData.fullName} />
          <InfoItem label="Email" value={userData.email} />
          <InfoItem label="Age" value={userData.age.toString()} />
          <InfoItem label="Gender" value={userData.gender} />
          <InfoItem label="Weight" value={userData.weight} />
          <InfoItem label="Height" value={userData.height} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.addressHeader}>
          <Text style={styles.sectionTitle}>Address Information</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditAddress', { addressData })}
          >
            <Icon name="edit" size={20} color="#000" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoContainer}>
          <InfoItem label="Street" value={addressData.street} />
          <InfoItem label="City" value={addressData.city} />
          <InfoItem label="State" value={addressData.state} />
          <InfoItem label="ZIP Code" value={addressData.zipCode} />
          <InfoItem label="Country" value={addressData.country} />
        </View>
      </View>
    </ScrollView>
  );
}

const InfoItem = ({ label, value }) => (
  <View style={styles.infoItem}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
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
  title: {
    fontSize: 28,
    fontFamily: 'Raleway-Bold',
  },
  section: {
    padding: 20,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Raleway-Bold',
    marginBottom: 15,
  },
  infoContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Raleway-Medium',
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontFamily: 'Raleway-Regular',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 8,
    borderRadius: 20,
  },
  editButtonText: {
    marginLeft: 5,
    fontFamily: 'Raleway-Medium',
  },
});