import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { supabase } from '../lib/supabase';
import { CommonActions } from '@react-navigation/native';

export default function ProfileScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    'Raleway-Regular': require('../assets/fonts/Raleway-Regular.ttf'),
    'Raleway-Medium': require('../assets/fonts/Raleway-Medium.ttf'),
    'Raleway-Bold': require('../assets/fonts/Raleway-Bold.ttf'),
  });

  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phone_number: '',
    date_of_birth: null,
    gender: '',
    weight: '',
    height: '',
  });

  const [addressData, setAddressData] = useState({
    street: 'Not set',
    city: 'Not set',
    state: 'Not set',
    zipCode: 'Not set',
    country: 'Not set'
  });

  useEffect(() => {
    getUserProfile();
  }, []);

  const getUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        if (data) {
          setUserData({
            fullName: data.full_name || '',
            email: user.email,
            phone_number: user.user_metadata.phone_number || '',
            date_of_birth: data.date_of_birth,
            gender: data.gender,
            weight: data.weight,
            height: data.height,
          });
          
          // Set address data if it exists
          setAddressData({
            street: data.street || 'Not set',
            city: data.city || 'Not set',
            state: data.state || 'Not set',
            zipCode: data.zip_code || 'Not set',
            country: data.country || 'Not set'
          });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error.message);
      Alert.alert('Error', 'Failed to load profile data');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} years`;
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Reset navigation state and redirect to Login
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        })
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
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
            <InfoItem label="Phone Number" value={userData.phone_number || 'Not set'} />
            <InfoItem label="Date of Birth" value={formatDate(userData.date_of_birth)} />
            <InfoItem label="Age" value={calculateAge(userData.date_of_birth)} />
            <InfoItem label="Gender" value={userData.gender || 'Not set'} />
            <InfoItem label="Weight" value={userData.weight ? `${userData.weight} KG` : 'Not set'} />
            <InfoItem label="Height" value={userData.height ? `${userData.height} cm` : 'Not set'} />
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

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  logoutButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 25,
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 20,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 18,
    fontFamily: 'Raleway-Bold',
    color: '#000',
  },
});