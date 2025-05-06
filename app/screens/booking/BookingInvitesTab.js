import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ToastAndroid, Platform, Button } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function BookingInvitesTab() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState({});

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

  // Advanced debugging function
  const debugDatabase = async () => {
    try {
      setLoading(true);
      const debug = {};
      
      // 1. Check authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      debug.auth = { user: user ? { id: user.id, email: user.email } : null, error: authError };
      
      if (!user) {
        setDebugInfo(debug);
        Alert.alert("Debug Info", "Not authenticated! See console for details.");
        console.log("DEBUG AUTH:", debug.auth);
        setLoading(false);
        return;
      }
      
      // 2. Check all booking invites (not filtered)
      const { data: allInvites, error: allInvitesError } = await supabase
        .from('booking_invites')
        .select('*')
        .limit(100);
      
      debug.allInvites = { count: allInvites?.length || 0, error: allInvitesError, sample: allInvites?.slice(0, 3) };
      
      // 3. Check pending invites for current user
      const { data: pendingInvites, error: pendingError } = await supabase
        .from('booking_invites')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');
      
      debug.pendingInvites = { count: pendingInvites?.length || 0, error: pendingError, data: pendingInvites };
      
      // 4. Check RLS policies by attempting to read another user's invites
      const { data: otherUserData, error: otherUserError } = await supabase
        .from('booking_invites')
        .select('*')
        .neq('receiver_id', user.id)
        .limit(1);
      
      debug.rlsCheck = { success: !otherUserError && otherUserData, error: otherUserError };
      
      // 5. Check if gyms data is accessible
      const { data: gymsData, error: gymsError } = await supabase
        .from('gyms')
        .select('*')
        .limit(3);
      
      debug.gyms = { count: gymsData?.length || 0, error: gymsError, sample: gymsData };
      
      // 6. Check if profiles data is accessible
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .limit(3);
      
      debug.profiles = { count: profilesData?.length || 0, error: profilesError };
      
      setDebugInfo(debug);
      console.log("COMPLETE DEBUG INFO:", JSON.stringify(debug, null, 2));
      Alert.alert(
        "Debug Results", 
        `Auth: ${user ? 'OK' : 'FAIL'}\n` +
        `All Invites: ${debug.allInvites.count}\n` +
        `Your Pending: ${debug.pendingInvites.count}\n` + 
        `RLS Check: ${debug.rlsCheck.success ? 'PASS' : 'RESTRICTED'}\n` +
        `Gyms: ${debug.gyms.count}\n` +
        `Profiles: ${debug.profiles.count}\n\n` +
        `See console for complete data`
      );
    } catch (error) {
      console.error("Debug error:", error);
      Alert.alert("Debug Error", error.message);
    } finally {
      setLoading(false);
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
      <Button 
        title="Debug Database" 
        onPress={debugDatabase} 
        color="#007bff"
      />
      
      <FlatList
        data={invites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.senderName}>{item.sender.full_name || item.sender.email}</Text>
              <Text style={styles.dateText}>{new Date(item.booking_date).toLocaleDateString()}</Text>
            </View>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailText}>{item.gyms?.name || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time:</Text>
                <Text style={styles.detailText}>{item.specific_time?.slice(0, 5)} ({item.time_slot})</Text>
              </View>
              {item.notes && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Notes:</Text>
                  <Text style={styles.detailText}>{item.notes}</Text>
                </View>
              )}
            </View>

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
            <Text style={styles.detailText}>Try the Debug button above to check database connectivity</Text>
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
    borderRadius: 12,
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
  senderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
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
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
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
    fontWeight: '600',
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