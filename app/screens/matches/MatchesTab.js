import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

const MatchesTab = ({ navigation }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all accepted requests where the current user is either the requester or the requested
      const { data: sentMatches, error: sentError } = await supabase
        .from('match_requests')
        .select(`
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
        .eq('status', 'accepted');

      const { data: receivedMatches, error: receivedError } = await supabase
        .from('match_requests')
        .select(`
          requester:profiles!match_requests_requester_id_fkey (
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
        .eq('requested_id', user.id)
        .eq('status', 'accepted');

      if (sentError || receivedError) throw sentError || receivedError;

      // Combine and format matches
      const allMatches = [
        ...(sentMatches || []).map(m => m.requested_profile),
        ...(receivedMatches || []).map(m => m.requester)
      ];

      setMatches(allMatches);
    } catch (error) {
      console.error('Error loading matches:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMatches();
    
    // Set up real-time subscription for match updates
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const subscription = supabase
        .channel('matches_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'match_requests',
            filter: `or(requester_id.eq.${user.id},requested_id.eq.${user.id})`
          },
          (payload) => {
            if (payload.eventType === 'UPDATE' && payload.new.status === 'accepted') {
              loadMatches(); // Reload matches when a request is accepted
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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadMatches();
  }, []);

  const getProfileImage = (profile) => {
    if (profile.profile_images && profile.profile_images.length > 0) {
      const primaryImage = profile.profile_images.find(img => img.is_primary);
      return primaryImage ? primaryImage.image_url : profile.profile_images[0].image_url;
    }
    return 'https://via.placeholder.com/150';
  };

  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('UserDetails', { user: item })}
    >
      <Image source={{ uri: getProfileImage(item) }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.full_name}</Text>
        <Text style={styles.cardDetail}>{item.belt_level} Belt</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No matches yet</Text>
          <Text style={styles.emptySubtext}>
            When you and another person both accept each other's requests, they'll appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 8,
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
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1,
  },
  cardContent: {
    padding: 12,
  },
  cardName: {
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 14,
    fontFamily: 'Raleway-Regular',
    color: '#666',
  },
});

export default MatchesTab;