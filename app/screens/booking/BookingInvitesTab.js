import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ToastAndroid, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';

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
    loadInvites();
    
    const subscription = supabase
      .channel('booking_invites_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'booking_invites',
      }, (payload) => {
        console.log('Realtime update:', payload);
        if (payload.eventType === 'UPDATE') {
          const updatedInvite = payload.new;
          console.log('Updated invite:', updatedInvite);
          setInvites(current => current.filter(invite => invite.id !== updatedInvite.id));
          showToast(`Invite ${updatedInvite.status} successfully`);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadInvites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        return;
      }

      console.log('Loading invites for user:', user.id);

      const { data, error } = await supabase
        .from('booking_invites')
        .select(`
          id,
          sender_id,
          receiver_id,
          status,
          booking_date,
          specific_time,
          time_slot,
          notes,
          created_at,
          updated_at
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (error) {
        console.error('Load error:', error);
        throw error;
      }

      console.log('Loaded invites:', data);
      setInvites(data || []);
    } catch (error) {
      console.error('Error:', error);
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

      // Get the current invite to verify receiver_id
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

      console.log('Attempting to update invite:', {
        inviteId,
        newStatus,
        userId: user.id,
        currentStatus: invite.status
      });

      const { data: updateData, error: updateError } = await supabase
        .from('booking_invites')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        showToast(`Failed to ${newStatus} invite: ${updateError.message}`);
        return;
      }

      console.log('Successfully updated invite:', updateData);
      showToast(`Invite ${newStatus} successfully`);
      
      // Remove from local state immediately
      setInvites(current => current.filter(invite => invite.id !== inviteId));
    } catch (error) {
      console.error('Response error:', error);
      showToast('Failed to process your response');
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
            <Text style={styles.text}>Invite from: {item.sender_id}</Text>
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.acceptButton]}
                onPress={() => handleResponse(item.id, 'accepted')}
              >
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.rejectButton]}
                onPress={() => handleResponse(item.id, 'rejected')}
              >
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pending invites</Text>
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
    backgroundColor: '#fff',
  },
  card: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 8,
    borderRadius: 4,
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
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});