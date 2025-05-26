import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ToastAndroid, Platform, Image } from 'react-native';
import { supabase } from '../../lib/supabase';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function BookingInvitesTab() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  };

  useEffect(() => {
    console.log('BookingInvitesTab mounted, calling loadInvites');
    loadInvites();
    
    // Set up real-time subscription with consistent channel name
    const subscription = supabase
      .channel('booking_invites_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'booking_invites',
      }, (payload) => {
        console.log('Realtime update received for invites:', payload);
        
        // Get current auth state to handle invites properly
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (!user) return;
          
          // Only reload for relevant changes
          if (payload.eventType === 'INSERT' && payload.new.receiver_id === user.id) {
            console.log('New invite received for current user, reloading invites');
            loadInvites();
          } else if (payload.eventType === 'UPDATE') {
            const updatedInvite = payload.new;
            if (updatedInvite.receiver_id === user.id) {
              console.log('Invite updated for current user:', updatedInvite);
              // If the invite was just updated but still pending, refresh the list
              if (updatedInvite.status === 'pending') {
                loadInvites();
              } else {
                // If status changed to something else, remove from the list
                setInvites(current => current.filter(invite => invite.id !== updatedInvite.id));
                showToast(`Invite ${updatedInvite.status}`);
              }
            }
          }
        });
      })
      .subscribe();

    return () => {
      console.log('BookingInvitesTab unmounting, unsubscribing');
      subscription.unsubscribe();
    };
  }, []);

  const loadInvites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        setLoading(false);
        return;
      }

      console.log('Loading invites for user:', user.id);

      // First get the invites with gym info
      const { data: invitesData, error: invitesError } = await supabase
        .from('booking_invites')
        .select(`
          *,
          gyms (
            id,
            name,
            address
          )
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      console.log('Raw invites data:', invitesData);

      if (invitesError) {
        console.error('Load invites error:', invitesError);
        throw invitesError;
      }

      if (!invitesData || invitesData.length === 0) {
        console.log('No pending invites found for user');
        setInvites([]);
        setLoading(false);
        return;
      }

      // Then get all sender user details in one query
      const senderIds = [...new Set(invitesData.map(invite => invite.sender_id))];
      console.log('Getting details for senders:', senderIds);

      // Try to get user profiles from the profiles table instead
      const { data: sendersData, error: sendersError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', senderIds);

      if (sendersError) {
        console.error('Load senders error from profiles:', sendersError);
        // Fallback to just using basic info
        const enrichedInvites = invitesData.map(invite => ({
          ...invite,
          sender: { 
            id: invite.sender_id, 
            email: 'User', 
            full_name: 'Training Partner' 
          }
        }));
        
        console.log('Enriched invites with basic info:', enrichedInvites);
        setInvites(enrichedInvites);
        setLoading(false);
        return;
      }

      console.log('Retrieved sender data:', sendersData);

      // Create a map of sender data for quick lookup
      const sendersMap = new Map(sendersData.map(sender => [sender.id, sender]));

      // Combine the data
      const enrichedInvites = invitesData.map(invite => ({
        ...invite,
        sender: sendersMap.get(invite.sender_id) || { 
          id: invite.sender_id,
          email: 'Unknown User',
          full_name: 'Unknown User'
        }
      }));

      console.log('Final enriched invites:', enrichedInvites);
      setInvites(enrichedInvites);

    } catch (error) {
      console.error('Error in loadInvites:', error);
      showToast('Failed to load invites');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (inviteId, newStatus) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        showToast('You must be logged in');
        return;
      }

      // First verify the invite exists and is still pending
      const { data: invite, error: fetchError } = await supabase
        .from('booking_invites')
        .select('*')
        .eq('id', inviteId)
        .single();

      if (fetchError || !invite) {
        console.error('Fetch error:', fetchError);
        showToast('Could not find the invite');
        return;
      }

      if (invite.receiver_id !== user.id) {
        console.error('User is not the receiver of this invite');
        showToast('You are not authorized to update this invite');
        return;
      }

      if (invite.status !== 'pending') {
        console.error('Invite is not pending:', invite.status);
        showToast('This invite is no longer pending');
        return;
      }

      // Remove from local state immediately to provide instant feedback
      setInvites(current => current.filter(inv => inv.id !== inviteId));

      // Update the invite status
      const { error: updateError } = await supabase
        .from('booking_invites')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (updateError) {
        console.error('Update error:', updateError);
        showToast(`Failed to ${newStatus} invite: ${updateError.message}`);
        // Revert local state on error
        loadInvites();
        return;
      }

      showToast(`Invite ${newStatus} successfully`);

    } catch (error) {
      console.error('Response error:', error);
      showToast('Failed to process your response');
      // Revert local state on error
      loadInvites();
    }
  };

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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={invites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Status tag */}
            <View style={styles.statusContainer}>
              <Text style={[
                styles.statusText, 
                { color: getStatusStyle('pending').color, backgroundColor: getStatusStyle('pending').backgroundColor }
              ]}>Pending</Text>
            </View>
            
            {/* Partner section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Icon name="user" size={16} color="#33363F" />
                <Text style={styles.sectionLabel}>Session Partner</Text>
              </View>
              <View style={styles.partnerRow}>
                <Image
                  source={{ uri: item.sender.profile_image_url || 'https://via.placeholder.com/100' }}
                  style={styles.avatar}
                />
                <Text style={styles.partnerName}>{item.sender.full_name || item.sender.email}</Text>
              </View>
            </View>
            
            {/* Date and time section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Icon name="calendar-o" size={16} color="#33363F" />
                <Text style={styles.sectionLabel}>Date & time</Text>
              </View>
              <Text style={styles.sectionValue}>
                {new Date(item.booking_date).toLocaleDateString('en-US', { 
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short'
                })} - {item.specific_time?.slice(0, 5)} {item.time_slot && `(${item.time_slot})`}
              </Text>
            </View>
            
            {/* Location section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Icon name="map-marker" size={16} color="#33363F" />
                <Text style={styles.sectionLabel}>Location</Text>
              </View>
              <Text style={styles.sectionValue}>
                {item.gyms?.name || 'Unknown Location'}
              </Text>
            </View>
            
            {/* Action buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.rejectButton]}
                onPress={() => handleResponse(item.id, 'rejected')}
              >
                <Text style={styles.rejectText}>✕ Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.acceptButton]}
                onPress={() => handleResponse(item.id, 'accepted')}
              >
                <Text style={styles.acceptText}>✓ Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pending invites</Text>
            <Text style={styles.detailText}>When you receive training invites, they will appear here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  statusContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  statusText: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  sectionContainer: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  sectionValue: {
    fontSize: 14,
    color: '#333333',
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    paddingTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#FFFFFF',
  },
  rejectButton: {
    backgroundColor: '#FFFFFF',
  },
  acceptText: {
    color: '#2E7D32',
    fontWeight: '500',
    fontSize: 14,
  },
  rejectText: {
    color: '#D32F2F',
    fontWeight: '500',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});