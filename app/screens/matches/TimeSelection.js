import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function TimeSelection({ navigation, route }) {
  const { selectedGym } = route.params;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const getTimeSlots = useCallback(() => {
    // In a real app, these would come from the gym's availability
    return {
      morning: ['07:00', '08:00', '09:00', '10:00', '11:00'],
      afternoon: ['12:00', '13:00', '14:00', '15:00', '16:00'],
      evening: ['17:00', '18:00', '19:00', '20:00', '21:00']
    };
  }, []);

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    if (route.params?.onSelect) {
      route.params.onSelect({
        date: selectedDate.toDateString(),
        time: time
      });
    }
  };

  const renderTimeSlot = (time) => (
    <TouchableOpacity
      key={time}
      style={[
        styles.timeSlot,
        selectedTime === time && styles.selectedTimeSlot
      ]}
      onPress={() => handleTimeSelect(time)}
    >
      <Text style={[
        styles.timeText,
        selectedTime === time && styles.selectedTimeText
      ]}>
        {time}
      </Text>
    </TouchableOpacity>
  );

  const timeSlots = getTimeSlots();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Time</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.gymHeader}>
          <Text style={styles.gymName}>{selectedGym.name}</Text>
          <Text style={styles.gymLocation}>{selectedGym.location}</Text>
        </View>

        <View style={styles.dateSection}>
          <Text style={styles.sectionTitle}>Date</Text>
          <TouchableOpacity 
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.dateContent}>
              <Icon name="calendar" size={24} color="#007BFF" />
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateText}>
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
              <Icon name="chevron-right" size={16} color="#666" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.timeSection}>
          <Text style={styles.sectionTitle}>Morning</Text>
          <View style={styles.timeSlotsContainer}>
            {timeSlots.morning.map(time => renderTimeSlot(time))}
          </View>

          <Text style={styles.sectionTitle}>Afternoon</Text>
          <View style={styles.timeSlotsContainer}>
            {timeSlots.afternoon.map(time => renderTimeSlot(time))}
          </View>

          <Text style={styles.sectionTitle}>Evening</Text>
          <View style={styles.timeSlotsContainer}>
            {timeSlots.evening.map(time => renderTimeSlot(time))}
          </View>
        </View>
      </View>

      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.cancelButton}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={styles.doneButton}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  style={styles.datePicker}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  gymHeader: {
    marginBottom: 24,
  },
  gymName: {
    fontSize: 24,
    fontFamily: 'Raleway-Bold',
    marginBottom: 4,
  },
  gymLocation: {
    fontSize: 16,
    fontFamily: 'Raleway-Regular',
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Raleway-Bold',
    marginBottom: 16,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateSelector: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTextContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Raleway-Medium',
  },
  timeSection: {
    flex: 1,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  timeSlot: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedTimeSlot: {
    backgroundColor: '#F0F9FF',
    borderColor: '#007BFF',
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Raleway-Medium',
    color: '#333',
  },
  selectedTimeText: {
    color: '#007BFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cancelButton: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Raleway-Medium',
  },
  doneButton: {
    color: '#007BFF',
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
  },
  datePicker: {
    height: 200,
  },
});