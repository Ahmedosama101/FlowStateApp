import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function RequestsTab() {
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSentRequests();
    
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const subscription = supabase
        .channel('match_requests_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'match_requests',
            filter: `requester_id=eq.${user.id}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setSentRequests(current => [payload.new, ...current]);
            } else if (payload.eventType === 'UPDATE') {
              setSentRequests(current =>
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

  const loadSentRequests = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('match_requests')
        .select(`
          *,
          requested_profile:profiles!match_requests_requested_id_fkey (
            id,
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
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSentRequests(data || []);
    } catch (error) {
      console.error('Error loading sent requests:', error.message);
    } finally {
      setLoading(false);
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
        source={{ uri: getProfileImage(item.requested_profile) }}
        style={styles.avatar}
      />
      <View style={styles.requestInfo}>
        <Text style={styles.name}>{item.requested_profile.full_name}</Text>
        <Text style={styles.details}>
          {item.requested_profile.gender} • {item.requested_profile.belt_level} Belt
        </Text>
        <Text style={styles.details}>
          {item.requested_profile.height} • {item.requested_profile.weight}
        </Text>
        <Text style={styles.status}>
          Status: <Text style={[
            styles.statusText,
            { color: getStatusColor(item.status) }
          ]}>{item.status.toUpperCase()}</Text>
        </Text>
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
      {sentRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No sent requests yet</Text>
          <Text style={styles.emptySubtext}>
            Swipe right on people you'd like to train with!
          </Text>
        </View>
      ) : (
        <FlatList
          data={sentRequests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadSentRequests}
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
  status: {
    fontSize: 14,
    fontFamily: 'Raleway-Medium',
    marginTop: 8,
  },
  statusText: {
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