import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';

const MatchesTab = ({ navigation }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Temporarily set static data for testing
    const staticMatches = [
      {
        id: '1',
        full_name: 'John Doe',
        profile_images: [
          { image_url: 'https://via.placeholder.com/150', is_primary: true }
        ]
      },
      {
        id: '2',
        full_name: 'Jane Smith',
        profile_images: [
          { image_url: 'https://via.placeholder.com/150', is_primary: true }
        ]
      }
    ];
    setMatches(staticMatches);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);

      // Step 1: Get the logged-in user ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error fetching user:', userError);
        setLoading(false);
        return;
      }

      console.log('Authenticated user:', user);
      if (!user) {
        setLoading(false);
        return;
      }

      const userId = user.id;

      // Step 2: Fetch matches where the user is either requester or requested
      const { data: matches, error: matchesError } = await supabase
        .from('match_requests')
        .select('id, requester_id, requested_id, status')
        .or(`requester_id.eq.${userId},requested_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (matchesError) {
        console.error('Error fetching matches:', matchesError);
        setLoading(false);
        return;
      }

      console.log('Matches:', matches);

      // Step 3: Extract the IDs of the matched users
      const matchedUserIds = matches.map(match => {
        return match.requester_id === userId ? match.requested_id : match.requester_id;
      });

      console.log('Matched user IDs:', matchedUserIds);

      // Step 4: Fetch profiles of the matched users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, gender, height, weight, belt_level')
        .in('id', matchedUserIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setLoading(false);
        return;
      }

      console.log('Matched profiles:', profiles);

      // Step 5: Set the matches state with the fetched profiles
      setMatches(profiles);
    } catch (error) {
      console.error('Error in fetchMatches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProfileImage = (item) => {
    // Check if profile_images exists and has items
    if (item.profile_images && Array.isArray(item.profile_images) && item.profile_images.length > 0) {
      // Find primary image or use the first one
      const primaryImage = item.profile_images.find(img => img && img.is_primary);
      return primaryImage ? primaryImage.image_url : item.profile_images[0].image_url;
    }
    return 'https://via.placeholder.com/150'; // Fallback image
  };

  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('UserDetails', { user: item })}
    >
      <Image 
        source={{ uri: getProfileImage(item) }} 
        style={styles.cardImage}
        resizeMode="cover"
      />
      <Text style={styles.cardName}>
        {item.full_name?.split(' ')[0] || 'User'}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0C2252" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No matches yet</Text>
          <Text style={styles.emptySubtext}>
            When you and another person both accept each other's requests, they'll appear here
          </Text>
        </View>
      ) : (
        <View style={styles.pageContainer}>
          <Text style={styles.headerText}>Your Matches</Text>
          <FlatList
            data={matches}
            renderItem={renderCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            columnWrapperStyle={styles.columnWrapper}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
    fontFamily: 'Raleway-Bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: 'Raleway-Regular',
    color: '#666',
    textAlign: 'center',
  },
  pageContainer: {
    flex: 1,
    padding: 16,
  },
  headerText: {
    fontSize: 22,
    fontFamily: 'Raleway-Bold',
    marginBottom: 16,
    marginLeft: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardName: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 16,
    fontFamily: 'Raleway-Medium',
    textAlign: 'center',
    color: '#333',
  },
});

export default MatchesTab;