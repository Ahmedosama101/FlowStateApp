import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import Icon from 'react-native-vector-icons/FontAwesome';

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

      console.log('Fetching received requests for user:', user.id);

      const { data, error } = await supabase
        .from('match_requests')
        .select(`
          *,
          requester:profiles!match_requests_requester_id_fkey (
            id,
            full_name,
            gender,
            belt_level,
            height,
            weight
          )
        `)
        .eq('requested_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching received requests:', error);
        throw error;
      }

      // Get all requester user IDs
      const requesterIds = data.map(request => request.requester_id);
      
      // Fetch primary profile images for the requester users
      const { data: profileImages, error: profileImagesError } = await supabase
        .from('profile_images')
        .select('profile_id, image_url')
        .in('profile_id', requesterIds)
        .eq('is_primary', true);
        
      if (profileImagesError) {
        console.error('Error fetching profile images:', profileImagesError);
      }
      
      // Create a map of profile_id to image URL
      const profileImageMap = {};
      if (profileImages && profileImages.length > 0) {
        profileImages.forEach(image => {
          profileImageMap[image.profile_id] = image.image_url;
        });
      }
      
      // Add primary image URL to each request's requester profile
      const requestsWithImages = data.map(request => ({
        ...request,
        requester: {
          ...request.requester,
          primaryImageUrl: profileImageMap[request.requester_id] || null
        }
      }));

      console.log('Fetched received requests:', requestsWithImages);
      setReceivedRequests(requestsWithImages || []);
    } catch (error) {
      console.error('Error loading received requests:', error.message);
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
      );      // If request was accepted, navigate to session invite screen
      if (status === 'accepted') {
        // Navigate to the session invite screen with the requester's info
        const matchedRequest = receivedRequests.find(r => r.id === requestId);
        if (matchedRequest) {
          navigation.navigate('SessionInvite', {
            partnerId: matchedRequest.requester_id,
            partnerName: matchedRequest.requester.full_name,
            matchRequestId: requestId,
            partnerImage: matchedRequest.requester.primaryImageUrl || getProfileImage(matchedRequest.requester)
          });
        }
      }
    } catch (error) {
      console.error('Error handling request response:', error.message);
      Alert.alert('Error', 'Failed to process your response. Please try again.');
    }
  };
  const getProfileImage = (profile) => {
    // First check if we have the primary image from our direct query
    if (profile.primaryImageUrl) {
      return profile.primaryImageUrl;
    }
    
    // Fallback to check if profile_images exists and has items
    if (profile.profile_images && profile.profile_images.length > 0) {
      const primaryImage = profile.profile_images.find(img => img.is_primary);
      return primaryImage ? primaryImage.image_url : profile.profile_images[0].image_url;
    }
    
    return 'https://via.placeholder.com/100';
  };

  const renderRequest = ({ item }) => (
    <View style={styles.requestCard}>
      {/* Status indicator */}
      <View style={styles.statusContainer}>
        <Text style={[
          styles.statusText, 
          { 
            color: getStatusStyle(item.status).color, 
            backgroundColor: getStatusStyle(item.status).backgroundColor 
          }
        ]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
      
      {/* Session Partner section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Icon name="user" size={16} color="#33363F" />
          <Text style={styles.sectionLabel}>Session Partner</Text>
        </View>
        <View style={styles.partnerRow}>
          <Image
            source={{ uri: getProfileImage(item.requester) }}
            style={styles.avatar}
          />
          <Text style={styles.partnerName}>{item.requester.full_name}</Text>
        </View>
      </View>
      
      {/* Date and Time section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Icon name="calendar-o" size={16} color="#33363F" />
          <Text style={styles.sectionLabel}>Date & time</Text>
        </View>
        <Text style={styles.sectionValue}>
          Sun, 15 Jan - 08:00 AM
        </Text>
      </View>
      
      {/* Location section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Icon name="map-marker" size={16} color="#33363F" />
          <Text style={styles.sectionLabel}>Location</Text>
        </View>
        <Text style={styles.sectionValue}>
          {item.requester.gym_name || 'Olympic Boxing Club, Calgary'}
        </Text>
      </View>
      
      {/* Action buttons for pending requests */}
      {item.status === 'pending' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => handleRequestResponse(item.id, 'rejected')}
          >
            <Text style={styles.declineText}>✕ Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleRequestResponse(item.id, 'accepted')}
          >
            <Text style={styles.acceptText}>✓ Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return { color: '#FFA500', backgroundColor: '#FFF3E0' };
      case 'accepted':
        return { color: '#4CAF50', backgroundColor: '#E8F5E9' };
      case 'rejected':
        return { color: '#F44336', backgroundColor: '#FFEBEE' };
      case 'cancelled':
        return { color: '#9E9E9E', backgroundColor: '#F5F5F5' };
      default:
        return { color: '#000000', backgroundColor: '#FFFFFF' };
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
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 8,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    padding: 16,
    position: 'relative',
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
  actionContainer: {
    flexDirection: 'row',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    paddingTop: 12,
  },
  declineButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  acceptButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  declineText: {
    color: '#D32F2F',
    fontWeight: '500',
    fontSize: 14,
  },
  acceptText: {
    color: '#2E7D32',
    fontWeight: '500',
    fontSize: 14,
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
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default MatchInvitesTab;