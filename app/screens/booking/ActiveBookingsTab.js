import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Button } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import { supabase } from '../../lib/supabase';

const Stack = createStackNavigator();

function BookingCard({ booking, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.partnerName}>
          {booking.sender?.full_name || booking.sender?.email}
        </Text>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Icon name="map-marker" size={16} color="#666" />
          <Text style={styles.detailText}>{booking.gyms?.name || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>
            {new Date(booking.booking_date).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="clock-o" size={16} color="#666" />
          <Text style={styles.detailText}>
            {booking.specific_time?.slice(0, 5)} ({booking.time_slot})
          </Text>
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
      if (!user) return;
      setUser(user);

      console.log('Current user ID:', user.id);

      // First get all accepted bookings with proper string format for the OR filter
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('booking_invites')
        .select(`
          *,
          gyms (
            id,
            name,
            address
          )
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted')
        // Only show future bookings
        .gte('booking_date', new Date().toISOString().split('T')[0]);

      if (bookingsError) {
        console.error('Error loading bookings:', bookingsError);
        throw bookingsError;
      }

      console.log('Retrieved bookings:', bookingsData);

      if (!bookingsData || bookingsData.length === 0) {
        console.log('No active bookings found');
        setBookings([]);
        setRefreshing(false);
        return;
      }

      // Get all user IDs involved in bookings
      const userIds = [...new Set([
        ...bookingsData.map(b => b.sender_id),
        ...bookingsData.map(b => b.receiver_id)
      ])];

      // Try to get user profiles from the auth.users table instead
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      if (usersError) {
        console.error('Error loading user details from profiles:', usersError);
        // If profiles table doesn't exist, just use basic user info
        const enrichedBookings = bookingsData.map(booking => {
          const isUserSender = booking.sender_id === user.id;
          const partnerId = isUserSender ? booking.receiver_id : booking.sender_id;
          
          return {
            ...booking,
            sender: { id: booking.sender_id, email: isUserSender ? user.email : 'Partner' },
            receiver: { id: booking.receiver_id, email: !isUserSender ? user.email : 'Partner' },
            partner: { id: partnerId, email: 'Partner' }
          };
        });
        
        console.log('Enriched bookings with basic info:', enrichedBookings);
        setBookings(enrichedBookings);
        return;
      }

      // Create a map for quick user lookup
      const usersMap = new Map(usersData.map(user => [user.id, user]));

      // Enrich bookings with user details
      const enrichedBookings = bookingsData.map(booking => {
        // Show the partner info - if current user is sender, show receiver, otherwise show sender
        const isUserSender = booking.sender_id === user.id;
        const partnerId = isUserSender ? booking.receiver_id : booking.sender_id;
        const partner = usersMap.get(partnerId) || { id: partnerId, email: 'Unknown User', full_name: 'Unknown User' };
        
        return {
          ...booking,
          sender: usersMap.get(booking.sender_id) || { id: booking.sender_id, email: 'Unknown', full_name: 'Unknown' },
          receiver: usersMap.get(booking.receiver_id) || { id: booking.receiver_id, email: 'Unknown', full_name: 'Unknown' },
          partner
        };
      });

      console.log('Enriched bookings with user details:', enrichedBookings);
      setBookings(enrichedBookings);
      
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setRefreshing(false);
    }
  };

  const debugActiveBookings = async () => {
    try {
      setRefreshing(true);
      const debug = {};
      
      // 1. Check authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      debug.auth = { user: user ? { id: user.id, email: user.email } : null, error: authError };
      
      if (!user) {
        console.log("DEBUG AUTH:", debug.auth);
        Alert.alert("Debug Info", "Not authenticated! See console for details.");
        setRefreshing(false);
        return;
      }
      
      // 2. Check all booking invites with status 'accepted'
      const { data: allAccepted, error: allAcceptedError } = await supabase
        .from('booking_invites')
        .select('*')
        .eq('status', 'accepted')
        .limit(100);
      
      debug.allAccepted = { count: allAccepted?.length || 0, error: allAcceptedError, sample: allAccepted?.slice(0, 3) };
      
      // 3. Check accepted invites for current user as receiver
      const { data: receiverInvites, error: receiverError } = await supabase
        .from('booking_invites')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'accepted');
      
      debug.receiverInvites = { count: receiverInvites?.length || 0, error: receiverError, sample: receiverInvites?.slice(0, 3) };
      
      // 4. Check accepted invites for current user as sender
      const { data: senderInvites, error: senderError } = await supabase
        .from('booking_invites')
        .select('*')
        .eq('sender_id', user.id)
        .eq('status', 'accepted');
      
      debug.senderInvites = { count: senderInvites?.length || 0, error: senderError, sample: senderInvites?.slice(0, 3) };
      
      console.log("ACTIVE BOOKINGS DEBUG INFO:", JSON.stringify(debug, null, 2));
      Alert.alert(
        "Active Bookings Debug", 
        `Auth: ${user ? 'OK' : 'FAIL'}\n` +
        `All Accepted: ${debug.allAccepted.count}\n` +
        `You as Receiver: ${debug.receiverInvites.count}\n` + 
        `You as Sender: ${debug.senderInvites.count}\n\n` +
        `See console for complete data`
      );
      
    } catch (error) {
      console.error("Debug error:", error);
      Alert.alert("Debug Error", error.message);
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
      <Button
        title="Debug Active Bookings" 
        onPress={debugActiveBookings} 
        color="#007bff"
      />
      
      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No Active Bookings</Text>
          <Text style={styles.emptySubtext}>Your accepted bookings will appear here</Text>
          <Text style={styles.emptySubtext}>Try the Debug button above to troubleshoot</Text>
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
    marginBottom: 16,
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
    textTransform: 'capitalize',
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