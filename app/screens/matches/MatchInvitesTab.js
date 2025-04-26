import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';

const MatchInvitesTab = ({ navigation }) => {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceivedRequests();
    
    // Set up real-time subscription
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const subscription = supabase
        .channel('received_requests_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'match_requests',
            filter: `requested_id=eq.${user.id}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              loadReceivedRequests();
            } else if (payload.eventType === 'UPDATE') {
              setReceivedRequests(current =>
                current.map(request =>
                  request.id === payload.new.id ? { ...request, ...payload.new } : request
                )
              );
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    };

    setupSubscription();
  }, []);

  const loadReceivedRequests = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('match_requests')
        .select(`
          *,
          requester:profiles!match_requests_requester_id_fkey (
            full_name,
            gender,
            belt_level,
            height,
            weight,
            profile_images (
              image_url,
              is_primary
            )
          )
        `)
        .eq('requested_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReceivedRequests(data);
    } catch (error) {
      console.error('Error loading received requests:', error.message);
      Alert.alert('Error', 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResponse = async (requestId, status) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        Alert.alert('Error', 'You must be logged in to perform this action');
        return;
      }

      // First verify the request exists and is pending
      const { data: request, error: verifyError } = await supabase
        .from('match_requests')
        .select('*')
        .eq('id', requestId)
        .eq('requested_id', user.id)
        .eq('status', 'pending')
        .single();

      if (verifyError || !request) {
        console.error('Request verification failed:', verifyError);
        Alert.alert('Error', 'Could not find the request or it has already been processed');
        return;
      }

      const { error: updateError } = await supabase
        .from('match_requests')
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('requested_id', user.id)
        .eq('status', 'pending')
        .select();

      if (updateError) {
        console.error('Update failed:', {
          error: updateError,
          code: updateError?.code,
          details: updateError?.details,
          hint: updateError?.hint
        });
        Alert.alert('Error', `Failed to ${status} request: ${updateError.message}`);
        return;
      }

      // Update local state
      setReceivedRequests(current =>
        current.map(request =>
          request.id === requestId ? { ...request, status } : request
        )
      );

      // If request was accepted, navigate to session invite screen
      if (status === 'accepted') {
        // Navigate to the session invite screen with the requester's info
        const matchedRequest = receivedRequests.find(r => r.id === requestId);
        if (matchedRequest) {
          navigation.navigate('SessionInvite', {
            partnerId: matchedRequest.requester_id,
            partnerName: matchedRequest.requester.full_name,
            matchRequestId: requestId
          });
        }
      }
    } catch (error) {
      console.error('Error handling request response:', error.message);
      Alert.alert('Error', 'Failed to process your response. Please try again.');
    }
  };

  const getProfileImage = (profile) => {
    if (profile.profile_images && profile.profile_images.length > 0) {
      const primaryImage = profile.profile_images.find(img => img.is_primary);
      return primaryImage ? primaryImage.image_url : profile.profile_images[0].image_url;
    }
    return 'https://via.placeholder.com/100';
  };

  const renderRequest = ({ item }) => (
    <View style={styles.requestCard}>
      <Image
        source={{ uri: getProfileImage(item.requester) }}
        style={styles.avatar}
      />
      <View style={styles.requestInfo}>
        <Text style={styles.name}>{item.requester.full_name}</Text>
        <Text style={styles.details}>
          {item.requester.gender} • {item.requester.belt_level} Belt
        </Text>
        <Text style={styles.details}>
          {item.requester.height} • {item.requester.weight}
        </Text>
        {item.message && (
          <Text style={styles.message}>{item.message}</Text>
        )}
        {item.status === 'pending' ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleRequestResponse(item.id, 'accepted')}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRequestResponse(item.id, 'rejected')}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        )}
      </View>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'accepted':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      case 'cancelled':
        return '#9E9E9E';
      default:
        return '#000000';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {receivedRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No received requests</Text>
          <Text style={styles.emptySubtext}>
            When someone wants to train with you, their request will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={receivedRequests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadReceivedRequests}
            />
          }
        />
      )}
    </View>
  );
};

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
  listContent: {
    padding: 16,
  },
  requestCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  requestInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Raleway-Bold',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    fontFamily: 'Raleway-Regular',
    color: '#666',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Raleway-Regular',
    color: '#444',
    marginTop: 8,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
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
    fontFamily: 'Raleway-Medium',
    fontSize: 14,
  },
  status: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Raleway-Bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: 'Raleway-Bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: 'Raleway-Regular',
    color: '#666',
    textAlign: 'center',
  },
});

export default MatchInvitesTab;