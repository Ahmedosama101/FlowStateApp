import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { supabase } from '../../lib/supabase';

export default function BookingInvitesTab() {
  const [receivedInvites, setReceivedInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReceivedInvites();
    setupRealtimeSubscription();
  }, []);

  const setupRealtimeSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // The user's auth ID is their profile ID
      const profileId = user.id;

      const subscription = supabase
        .channel('booking_invites_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'booking_invites',
            filter: `receiver_id=eq.${profileId}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              loadReceivedInvites();
            } else if (payload.eventType === 'UPDATE') {
              setReceivedInvites(current =>
                current.map(invite =>
                  invite.id === payload.new.id ? { ...invite, ...payload.new } : invite
                )
              );
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
    }
  };

  const loadReceivedInvites = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return;
      }

      console.log('Loading invites for user:', user.id);

      const { data, error } = await supabase
        .from('booking_invites')
        .select(`
          id,
          status,
          booking_date,
          specific_time,
          time_slot,
          sender:profiles!booking_invites_sender_id_fkey (
            full_name
          ),
          gyms (
            name,
            address
          )
        `)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Booking invites error:', error);
        throw error;
      }

      console.log('Received invites:', data);
      setReceivedInvites(data || []);
    } catch (error) {
      console.error('Error loading received invites:', error.message);
      Alert.alert('Error', 'Failed to load invites');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleInviteResponse = async (inviteId, status) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in to perform this action');
        return;
      }

      // In our schema, the profile id is the same as the auth user id
      const profileId = user.id;

      const { error } = await supabase
        .from('booking_invites')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteId)
        .eq('receiver_id', profileId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error updating invite:', error);
        Alert.alert('Error', `Failed to ${status} invite`);
        return;
      }

      // After successful update, reload the invites to get fresh data
      loadReceivedInvites();

      Alert.alert(
        'Success',
        `Booking invite ${status === 'accepted' ? 'accepted' : 'rejected'} successfully`
      );
    } catch (error) {
      console.error('Error handling invite response:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const renderInvite = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.partnerName}>{item.sender?.full_name || 'Unknown User'}</Text>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Gym:</Text>
          <Text style={styles.detailText}>{item.gyms?.name || 'Unknown Gym'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailText}>
            {new Date(item.booking_date).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time:</Text>
          <Text style={styles.detailText}>
            {item.specific_time?.slice(0, 5)} ({item.time_slot})
          </Text>
        </View>
      </View>

      {item.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleInviteResponse(item.id, 'accepted')}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleInviteResponse(item.id, 'rejected')}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#4CAF50';
      case 'pending': return '#FFC107';
      case 'rejected': return '#F44336';
      default: return '#757575';
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {receivedInvites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No Booking Invites</Text>
          <Text style={styles.emptySubtext}>
            When someone invites you to train, their invite will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={receivedInvites}
          renderItem={renderInvite}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadReceivedInvites();
              }}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  listContent: {
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
  partnerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailsContainer: {
    marginVertical: 12,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    fontWeight: '600',
    width: 50,
    color: '#666',
  },
  detailText: {
    flex: 1,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});