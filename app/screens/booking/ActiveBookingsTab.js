import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import { supabase } from '../../lib/supabase';

const Stack = createStackNavigator();

function BookingCard({ booking, onPress }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#757575';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.partnerName}>{booking.sender?.full_name || 'Unknown Partner'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Text style={styles.statusText}>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</Text>
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Icon name="map-marker" size={16} color="#666" />
          <Text style={styles.detailText}>{booking.gyms?.name || 'Unknown Location'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>{new Date(booking.booking_date).toLocaleDateString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="clock-o" size={16} color="#666" />
          <Text style={styles.detailText}>{booking.specific_time?.slice(0, 5)} ({booking.time_slot})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function BookingDetailScreen({ route, navigation }) {
  const { booking } = route.params;

  const handleCancel = async () => {
    try {
      const { error } = await supabase
        .from('booking_invites')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);

      if (error) throw error;

      Alert.alert('Success', 'Booking cancelled successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      Alert.alert('Error', 'Failed to cancel booking');
    }
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
          <Text style={styles.sectionContent}>{booking.sender?.full_name}</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.sectionContent}>{booking.gyms?.name}</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <Text style={styles.sectionContent}>
            {new Date(booking.booking_date).toLocaleDateString()} at {booking.specific_time?.slice(0, 5)}
          </Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Time Slot</Text>
          <Text style={styles.sectionContent}>{booking.time_slot}</Text>
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
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('booking_invites')
        .select(`
          id,
          status,
          booking_date,
          specific_time,
          time_slot,
          notes,
          sender:sender_id (
            email,
            raw_user_meta_data->>'full_name'
          ),
          receiver:receiver_id (
            email,
            raw_user_meta_data->>'full_name'
          ),
          gyms (
            name,
            address
          )
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('booking_date', { ascending: true });

      if (error) throw error;
      console.log('Active bookings:', data);
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('booking_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'booking_invites'
      }, () => {
        loadBookings();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadBookings();
  }, []);

  const handleBookingPress = (booking) => {
    navigation.navigate('BookingDetail', { booking });
  };

  const renderBooking = ({ item }) => {
    const isReceiver = item.receiver_id === user?.id;
    const partner = isReceiver ? item.sender : item.receiver;
    const partnerName = partner?.raw_user_meta_data?.full_name || partner?.email || 'Unknown Partner';

    return (
      <TouchableOpacity style={styles.card} onPress={() => handleBookingPress(item)}>
        <View style={styles.cardHeader}>
          <Text style={styles.partnerName}>{partnerName}</Text>
          <Text style={styles.detail}>at {item.gyms?.name || 'Unknown Gym'}</Text>
        </View>
        
        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Icon name="calendar" size={16} color="#666" />
            <Text style={styles.detailText}>
              {new Date(item.booking_date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="clock-o" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.specific_time?.slice(0, 5)} ({item.time_slot})
            </Text>
          </View>
          {item.notes && (
            <View style={styles.detailRow}>
              <Icon name="sticky-note-o" size={16} color="#666" />
              <Text style={styles.detailText}>{item.notes}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No Active Bookings</Text>
          <Text style={styles.emptySubtext}>Your accepted bookings will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
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
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
});