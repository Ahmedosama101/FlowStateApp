import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function TimeSelection({ navigation, route }) {
  const { selectedGym, onSelect } = route.params;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Generate an array for the next 7 days
  const generateWeekDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      days.push({
        date,
        dayNum: date.getDate(),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
      });
    }
    
    return days;
  };

  const weekDays = generateWeekDays();
  
  // Initialize with the first day selected
  useEffect(() => {
    if (weekDays.length > 0 && !selectedDay) {
      setSelectedDay(weekDays[1]); // Select the second day (tomorrow) by default
    }
  }, []);

  const handleDaySelect = (day) => {
    setSelectedDay(day);
    setSelectedDate(day.date);
    // Reset time selection when changing day
    setSelectedTimeSlot(null);
    setSelectedTime(null);
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
    setSelectedTime(null); // Reset specific time when changing slot
  };
  
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    
    if (onSelect && selectedDay) {
      onSelect({
        date: selectedDay.date.toDateString(),
        time: time
      });
    }
  };
  
  // Get time options based on selected slot
  const getTimeOptions = () => {
    if (!selectedTimeSlot) return [];
    
    switch (selectedTimeSlot) {
      case 'morning':
        return [
          { label: '09:00 AM', value: '09:00' },
          { label: '10:00 AM', value: '10:00' },
          { label: '10:30 AM', value: '10:30' },
          { label: '11:00 AM', value: '11:00' },
          { label: '11:30 AM', value: '11:30' },
          { label: '12:00 PM', value: '12:00' },
        ];
      case 'afternoon':
        return [
          { label: '12:30 PM', value: '12:30' },
          { label: '13:00 PM', value: '13:00' },
          { label: '14:00 PM', value: '14:00' },
          { label: '15:00 PM', value: '15:00' },
          { label: '16:00 PM', value: '16:00' },
          { label: '17:30 PM', value: '17:30' },
        ];
      case 'night':
        return [
          { label: '18:00 PM', value: '18:00' },
          { label: '18:30 PM', value: '18:30' },
          { label: '19:00 PM', value: '19:00' },
          { label: '19:30 PM', value: '19:30' },
          { label: '20:00 PM', value: '20:00' },
          { label: '21:00 PM', value: '21:00' },
        ];
      default:
        return [];
    }
  };
  
  // Group the time options into rows of 3
  const timeOptions = getTimeOptions();
  const timeRows = [];
  for (let i = 0; i < timeOptions.length; i += 3) {
    timeRows.push(timeOptions.slice(i, i + 3));
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Time</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.calendarCard}>
          <Text style={styles.calendarTitle}>When do you plan on going?</Text>
          
          <View style={styles.weekContainer}>
            <TouchableOpacity style={styles.arrowButton}>
              <Icon name="chevron-left" size={16} color="#ccc" />
            </TouchableOpacity>
            
            <View style={styles.daysContainer}>
              {weekDays.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayItem,
                    selectedDay?.dayNum === day.dayNum && styles.selectedDayItem
                  ]}
                  onPress={() => handleDaySelect(day)}
                >
                  <Text style={[
                    styles.dayLetter,
                    selectedDay?.dayNum === day.dayNum && styles.selectedDayText
                  ]}>
                    {day.dayName}
                  </Text>
                  <Text style={[
                    styles.dayNumber,
                    selectedDay?.dayNum === day.dayNum && styles.selectedDayText
                  ]}>
                    {day.dayNum}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity style={styles.arrowButton}>
              <Icon name="chevron-right" size={16} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.slotsTitle}>Available slots</Text>
          
          <View style={styles.timeSlotRow}>
            <TouchableOpacity 
              style={[
                styles.timeSlotTab, 
                selectedTimeSlot === 'morning' && styles.selectedTimeSlotTab
              ]}
              onPress={() => handleTimeSlotSelect('morning')}
            >
              <Icon name="sun-o" size={16} color={selectedTimeSlot === 'morning' ? "#FF9500" : "#FF9500"} style={styles.slotIcon} />
              <Text style={styles.timeSlotText}>Morning</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.timeSlotTab, 
                selectedTimeSlot === 'afternoon' && styles.selectedTimeSlotTab
              ]}
              onPress={() => handleTimeSlotSelect('afternoon')}
            >
              <Icon name="sun-o" size={16} color={selectedTimeSlot === 'afternoon' ? "#FF9500" : "#FF9500"} style={styles.slotIcon} />
              <Text style={styles.timeSlotText}>Afternoon</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.timeSlotTab, 
                selectedTimeSlot === 'night' && styles.selectedTimeSlotTabNight
              ]}
              onPress={() => handleTimeSlotSelect('night')}
            >
              <Icon name="moon-o" size={16} color={selectedTimeSlot === 'night' ? "#FFFFFF" : "#00008B"} style={styles.slotIcon} />
              <Text style={[
                styles.timeSlotText,
                selectedTimeSlot === 'night' && styles.selectedNightText
              ]}>Night</Text>
            </TouchableOpacity>
          </View>
          
          {selectedTimeSlot && (
            <View style={styles.timesContainer}>
              {timeRows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.timeRow}>
                  {row.map((time, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeButton,
                        selectedTime === time.value && styles.selectedTimeButton
                      ]}
                      onPress={() => handleTimeSelect(time.value)}
                    >
                      <Text style={styles.timeButtonText}>{time.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarTitle: {
    fontSize: 18,
    fontFamily: 'Raleway-Bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  arrowButton: {
    padding: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  dayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 4,
  },
  selectedDayItem: {
    backgroundColor: '#1E3A8A',
  },
  dayLetter: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Raleway-Medium',
  },
  dayNumber: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Raleway-Bold',
  },
  selectedDayText: {
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  slotsTitle: {
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  timeSlotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeSlotTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  selectedTimeSlotTab: {
    backgroundColor: '#FEF3E7',
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  selectedTimeSlotTabNight: {
    backgroundColor: '#1E3A8A',
  },
  slotIcon: {
    marginRight: 6,
  },
  timeSlotText: {
    fontFamily: 'Raleway-Medium',
    fontSize: 14,
    color: '#333',
  },
  selectedNightText: {
    color: '#FFFFFF',
  },
  timesContainer: {
    marginTop: 16,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeButton: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedTimeButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  timeButtonText: {
    fontFamily: 'Raleway-Medium',
    fontSize: 14,
    color: '#333',
  },
});