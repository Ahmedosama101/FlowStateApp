import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Button, Image } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import { supabase } from '../../lib/supabase';

const Stack = createStackNavigator();

function BookingCard({ booking, onPress }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return { color: '#F3AA18', backgroundColor: '#FFF8E7' };
      case 'accepted':
        return { color: '#4CAF50', backgroundColor: '#E8F5E9' };
      case 'rejected':
      case 'cancelled':
        return { color: '#E53935', backgroundColor: '#FFEBEE' };
      default:
        return { color: '#757575', backgroundColor: '#F5F5F5' };
    }
  };
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Status indicator at top-right */}
      <View style={styles.statusContainer}>
        <Text style={[
          styles.statusText, 
          { color: getStatusStyle(booking.status).color, backgroundColor: getStatusStyle(booking.status).backgroundColor }
        ]}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Text>
      </View>
      
      <View style={styles.sectionRow}>
        <Icon name="user" size={16} color="#33363F" style={styles.sectionIcon} />
        <Text style={styles.sectionLabel}>Session Partner</Text>
      </View>
      <View style={styles.partnerContainer}>
        {booking.partner?.profile_image_url ? (
          <Image 
            source={{ uri: booking.partner.profile_image_url }} 
            style={styles.partnerImage}
          />
        ) : (
          <View style={styles.partnerImagePlaceholder}>
            <Text style={styles.partnerInitials}>
              {(booking.sender?.full_name || booking.sender?.email || "U").charAt(0)}
            </Text>
          </View>
        )}
        <Text style={styles.partnerName}>
          {booking.sender?.full_name || booking.sender?.email || "Unknown Partner"}
        </Text>
      </View>

      <View style={styles.sectionRow}>
        <Icon name="calendar-o" size={16} color="#33363F" style={styles.sectionIcon} />
        <Text style={styles.sectionLabel}>Date & time</Text>
      </View>
      <Text style={styles.valueText}>
        {new Date(booking.booking_date).toLocaleDateString('en-US', { 
          weekday: 'short', 
          day: '2-digit', 
          month: 'short'
        })} - {booking.specific_time?.slice(0, 5)} {booking.time_slot && `(${booking.time_slot})`}
      </Text>

      <View style={styles.sectionRow}>
        <Icon name="map-marker" size={16} color="#33363F" style={styles.sectionIcon} />
        <Text style={styles.sectionLabel}>Location</Text>
      </View>
      <Text style={styles.valueText}>{booking.gyms?.name || 'Unknown Location'}</Text>
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
          <Text style={styles.sectionContent}>{booking.sender?.full_name || booking.sender?.email}</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.sectionContent}>{booking.gyms?.name}</Text>
          {booking.gyms?.address && (
            <Text style={[styles.sectionContent, styles.addressText]}>{booking.gyms.address}</Text>
          )}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <Text style={styles.sectionContent}>
            {new Date(booking.booking_date).toLocaleDateString()} at {booking.specific_time?.slice(0, 5)}
          </Text>
          <Text style={[styles.sectionContent, styles.timeSlotText]}>({booking.time_slot})</Text>
        </View>

        {booking.notes && (
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.sectionContent}>{booking.notes}</Text>
          </View>
        )}

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
  const [user, setUser] = useState(null);

  const loadBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        setRefreshing(false);
        return;
      }
      
      setUser(user);
      console.log('Current user ID:', user.id);

      // Try a completely different approach - manually checking both conditions
      const userId = user.id;
      
      // First, check bookings where user is receiver
      const { data: receiverBookings, error: receiverError } = await supabase
        .from('booking_invites')
        .select(`
          *,
          gyms (
            id,
            name,
            address
          )
        `)
        .eq('receiver_id', userId)
        .eq('status', 'accepted');
        
      if (receiverError) {
        console.error('Error loading receiver bookings:', receiverError);
        throw receiverError;
      }
      
      // Then, check bookings where user is sender
      const { data: senderBookings, error: senderError } = await supabase
        .from('booking_invites')
        .select(`
          *,
          gyms (
            id,
            name,
            address
          )
        `)
        .eq('sender_id', userId)
        .eq('status', 'accepted');
        
      if (senderError) {
        console.error('Error loading sender bookings:', senderError);
        throw senderError;
      }
      
      // Combine both sets of bookings
      let allUserBookings = [...(receiverBookings || []), ...(senderBookings || [])];
      
      console.log('All user bookings (combined):', allUserBookings.length);
      
      // REMOVED date filtering to show all accepted bookings regardless of date
      // This ensures users can see their booking history
      
      console.log('User bookings to display:', allUserBookings.length);
      
      if (allUserBookings.length === 0) {
        console.log('No active bookings found');
        setBookings([]);
        setRefreshing(false);
        return;
      }

      // Get all user IDs involved in bookings for user info enrichment
      const userIds = [...new Set([
        ...allUserBookings.map(b => b.sender_id),
        ...allUserBookings.map(b => b.receiver_id)
      ])];

      console.log('Getting profiles for user IDs:', userIds);

      // Get user profiles with more debugging
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      if (usersError) {
        console.error('Error fetching profiles:', usersError);
      }

      console.log('Retrieved profiles:', usersData);

      // Create a map for quick user lookup
      const usersMap = new Map();
      
      if (usersData && usersData.length > 0) {
        usersData.forEach(userData => {
          if (userData && userData.id) {
            usersMap.set(userData.id, userData);
            console.log(`Mapped user ${userData.id} to ${userData.full_name || userData.email}`);
          }
        });
      }

      // Enrich bookings with user details
      const enrichedBookings = allUserBookings.map(booking => {
        const isUserSender = booking.sender_id === userId;
        const partnerId = isUserSender ? booking.receiver_id : booking.sender_id;
        const partnerData = usersMap.get(partnerId);
        
        console.log(`Partner ID ${partnerId}: `, partnerData);
        
        const partner = partnerData || { 
          id: partnerId, 
          email: 'Unknown User', 
          full_name: 'Training Partner' 
        };
        
        const senderData = usersMap.get(booking.sender_id);
        const receiverData = usersMap.get(booking.receiver_id);
        
        return {
          ...booking,
          sender: senderData || { 
            id: booking.sender_id, 
            email: 'Unknown', 
            full_name: isUserSender ? user.email : 'Unknown User' 
          },
          receiver: receiverData || { 
            id: booking.receiver_id, 
            email: 'Unknown', 
            full_name: !isUserSender ? user.email : 'Unknown User' 
          },
          partner
        };
      });

      console.log('Final enriched bookings to display:', enrichedBookings.length);
      setBookings(enrichedBookings);
      
    } catch (error) {
      console.error('Error in loadBookings:', error);
      Alert.alert('Error', 'Failed to load bookings: ' + error.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
    
    // Set up real-time subscription with consistent channel name
    const subscription = supabase
      .channel('booking_invites_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'booking_invites'
      }, async (payload) => {
        console.log('Booking change received:', payload);
        if (payload.eventType === 'UPDATE') {
          // Get the current user
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const updatedInvite = payload.new;
          // Reload bookings if the invite was accepted and involves the current user
          if (updatedInvite.status === 'accepted' && 
              (updatedInvite.sender_id === user.id || updatedInvite.receiver_id === user.id)) {
            console.log('Reloading bookings due to accepted invite');
            loadBookings();
          }
        }
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

  const renderBooking = ({ item }) => (
    <BookingCard booking={item} onPress={() => handleBookingPress(item)} />
  );

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
  statusContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  partnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  partnerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  partnerImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  partnerInitials: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  valueText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
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
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 70,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#666',
  },
});