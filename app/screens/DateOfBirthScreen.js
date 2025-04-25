import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { supabase } from '../lib/supabase';

export default function DateOfBirthScreen({ navigation }) {
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const getDaysInMonth = (month, year) => {
    if (!month || !year) return Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
    return Array.from(
      { length: new Date(year, parseInt(month), 0).getDate() },
      (_, i) => String(i + 1).padStart(2, '0')
    );
  };

  const [fontsLoaded] = useFonts({
    'Raleway-Regular': require('../assets/fonts/Raleway-Regular.ttf'),
    'Raleway-Medium': require('../assets/fonts/Raleway-Medium.ttf'),
    'Raleway-Bold': require('../assets/fonts/Raleway-Bold.ttf'),
  });

  const handleContinue = async () => {
    if (!selectedDay || !selectedMonth || !selectedYear) {
      Alert.alert('Error', 'Please select your complete date of birth.');
      return;
    }

    const dateOfBirth = `${selectedYear}-${selectedMonth}-${selectedDay}`;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigation.navigate('Auth');
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          date_of_birth: dateOfBirth,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      navigation.navigate('Weight');
    } catch (error) {
      console.error('Error saving date of birth:', error.message);
      Alert.alert('Error', 'Failed to save your date of birth. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="chevron-left" size={20} color="#33363F" />
      </TouchableOpacity>
      
      <Text style={styles.title}>When Were You Born?</Text>

      <View style={styles.datePickersContainer}>
        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Day</Text>
          <ScrollView style={styles.dropdown} nestedScrollEnabled>
            {getDaysInMonth(selectedMonth, selectedYear).map((day) => (
              <TouchableOpacity
                key={day}
                style={[styles.option, selectedDay === day && styles.selectedOption]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[styles.optionText, selectedDay === day && styles.selectedOptionText]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Month</Text>
          <ScrollView style={styles.dropdown} nestedScrollEnabled>
            {months.map((month) => (
              <TouchableOpacity
                key={month.value}
                style={[styles.option, selectedMonth === month.value && styles.selectedOption]}
                onPress={() => setSelectedMonth(month.value)}
              >
                <Text style={[styles.optionText, selectedMonth === month.value && styles.selectedOptionText]}>
                  {month.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Year</Text>
          <ScrollView style={styles.dropdown} nestedScrollEnabled>
            {years.map((year) => (
              <TouchableOpacity
                key={year}
                style={[styles.option, selectedYear === String(year) && styles.selectedOption]}
                onPress={() => setSelectedYear(String(year))}
              >
                <Text style={[styles.optionText, selectedYear === String(year) && styles.selectedOptionText]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          (!selectedDay || !selectedMonth || !selectedYear || loading) && styles.disabledButton
        ]}
        onPress={handleContinue}
        disabled={!selectedDay || !selectedMonth || !selectedYear || loading}
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
    backgroundColor: '#fff',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Raleway-Bold',
    marginTop: 100,
    marginBottom: 40,
    textAlign: 'center',
  },
  datePickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  dropdownContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  dropdown: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    maxHeight: 200,
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedOption: {
    backgroundColor: '#BBD4F9',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Raleway-Regular',
    textAlign: 'center',
  },
  selectedOptionText: {
    fontFamily: 'Raleway-Bold',
    color: '#000',
  },
  continueButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Raleway-Bold',
  },
});