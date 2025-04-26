import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import UserWelcome from '../../components/UserWelcome';
import { supabase } from '../../lib/supabase';

// Dummy data for now - will be replaced with real data from supabase
const dummyBookings = [
  {
    id: '1',
    partner: 'Alex Johnson',
    location: 'Elite BJJ Academy',
    date: '2025-04-20',
    time: '10:00 AM',
    status: 'confirmed',
    notes: 'No-gi session',
  },
  {
    id: '2',
    partner: 'Sarah Smith',
    location: 'Gracie Combat Center',
    date: '2025-04-22',
    time: '2:30 PM',
    status: 'pending',
    notes: 'Gi training',
  },
  {
    id: '3',
    partner: 'Mike Wilson',
    location: 'Modern Jiu-Jitsu',
    date: '2025-04-25',
    time: '4:00 PM',
    status: 'upcoming',
    notes: 'Competition prep',
  }
];

function BookingCard({ booking, onCancel, onPress }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FFC107';
      case 'cancelled': return '#F44336';
      case 'upcoming': return '#2196F3';
      default: return '#757575';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.partnerName}>{booking.partner}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Text style={styles.statusText}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Icon name="map-marker" size={16} color="#666" />
          <Text style={styles.detailText}>{booking.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>{booking.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="clock-o" size={16} color="#666" />
          <Text style={styles.detailText}>{booking.time}</Text>
        </View>
        {booking.notes && (
          <View style={styles.detailRow}>
            <Icon name="sticky-note-o" size={16} color="#666" />
            <Text style={styles.detailText}>{booking.notes}</Text>
          </View>
        )}
      </View>

      {(booking.status === 'confirmed' || booking.status === 'pending') && (
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => onCancel(booking.id)}
        >
          <Text style={styles.cancelButtonText}>Cancel Session</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

export default function BookingScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState(dummyBookings);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // TODO: Add real data fetching here
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleCancel = (bookingId) => {
    Alert.alert(
      'Cancel Session',
      'Are you sure you want to cancel this training session?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            // TODO: Add real cancellation logic here
            setBookings(current =>
              current.map(booking =>
                booking.id === bookingId
                  ? { ...booking, status: 'cancelled' }
                  : booking
              )
            );
            Alert.alert('Success', 'Session cancelled successfully');
          },
        },
      ]
    );
  };

  const handleBookingPress = (booking) => {
    Alert.alert(
      'Session Details',
      `Partner: ${booking.partner}\nLocation: ${booking.location}\nDate: ${booking.date}\nTime: ${booking.time}\nNotes: ${booking.notes}`
    );
  };

  return (
    <View style={styles.container}>
      <UserWelcome user={{ name: null, profileImage: null }} />
      <FlatList
        data={bookings}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onCancel={handleCancel}
            onPress={() => handleBookingPress(item)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 35,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});