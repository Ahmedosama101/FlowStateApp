import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';

const Stack = createStackNavigator();

// Dummy data for active bookings
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
    notes: 'Gi training, bring your own gi',
  },
  {
    id: '3',
    partner: 'Mike Wilson',
    location: 'Modern Jiu-Jitsu',
    date: '2025-04-25',
    time: '4:00 PM',
    status: 'cancelled',
    notes: 'Competition prep session',
  },
];

function BookingCard({ booking, onPress }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FFC107';
      case 'cancelled': return '#F44336';
      default: return '#757575';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.partnerName}>{booking.partner}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Text style={styles.statusText}>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</Text>
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
      </View>
    </TouchableOpacity>
  );
}

function BookingDetailScreen({ route, navigation }) {
  const { booking } = route.params;

  const handleCancel = () => {
    // Add cancellation logic here
    alert('Booking cancelled successfully');
    navigation.goBack();
  };

  return (
    <View style={styles.detailContainer}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Icon name="chevron-left" size={20} color="#33363F" />
      </TouchableOpacity>

      <Text style={styles.detailTitle}>Booking Details</Text>
      
      <View style={styles.detailContent}>
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Partner</Text>
          <Text style={styles.sectionContent}>{booking.partner}</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.sectionContent}>{booking.location}</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <Text style={styles.sectionContent}>{booking.date} at {booking.time}</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={[styles.statusBadge, { 
            backgroundColor: booking.status === 'confirmed' ? '#4CAF50' : 
                           booking.status === 'pending' ? '#FFC107' : '#F44336'
          }]}>
            <Text style={styles.statusText}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.sectionContent}>{booking.notes}</Text>
        </View>

        {booking.status !== 'cancelled' && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function BookingsList({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Add your data fetching logic here
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const renderBooking = ({ item }) => (
    <BookingCard
      booking={item}
      onPress={() => navigation.navigate('BookingDetail', { booking: item })}
    />
  );

  return (
    <FlatList
      data={dummyBookings}
      renderItem={renderBooking}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

export default function ActiveBookingsTab() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BookingsList" component={BookingsList} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
  detailContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 18,
    color: '#333',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});