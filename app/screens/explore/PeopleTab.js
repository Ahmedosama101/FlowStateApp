import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');

export default function PeopleTab({ navigation }) {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [swiped, setSwiped] = useState(new Set());
  const [selectedUser, setSelectedUser] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First get all existing requests/invites for the current user
      const { data: existingRequests, error: requestsError } = await supabase
        .from('match_requests')
        .select('requester_id, requested_id')
        .or(`requester_id.eq.${user.id},requested_id.eq.${user.id}`);

      if (requestsError) throw requestsError;

      // Create sets of user IDs to exclude
      const excludeUserIds = new Set([
        user.id, // Exclude current user
        ...(existingRequests || []).map(r => r.requester_id), // Exclude users who sent requests
        ...(existingRequests || []).map(r => r.requested_id), // Exclude users who received requests
      ]);

      // Fetch all profiles except those with existing interactions
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
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
        `)
        .not('id', 'in', `(${Array.from(excludeUserIds).join(',')})`);

      if (error) throw error;

      // Format the data
      const formattedProfiles = profiles
        .filter(profile => profile.full_name) // Only show profiles that have at least a name
        .map(profile => ({
          id: profile.id,
          name: profile.full_name,
          images: profile.profile_images?.map(img => img.image_url) || ['https://via.placeholder.com/150'],
          gender: profile.gender,
          height: profile.height,
          weight: profile.weight,
          belt: profile.belt_level
        }));

      setAvailableUsers(formattedProfiles);
    } catch (error) {
      console.error('Error loading profiles:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeRight = async (cardIndex) => {
    const requestedUser = availableUsers[cardIndex];
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      // Check if there's already an active request between these users
      const { data: existingRequests, error: checkError } = await supabase
        .from('match_requests')
        .select('*')
        .or(`and(requester_id.eq.${user.id},requested_id.eq.${requestedUser.id}),and(requester_id.eq.${requestedUser.id},requested_id.eq.${user.id})`)
        .eq('status', 'pending');

      if (checkError) throw checkError;

      if (existingRequests && existingRequests.length > 0) {
        console.log('Request already exists between these users');
        // Still remove from available users to prevent duplicate requests
        setSwiped(prev => new Set([...prev, requestedUser.id]));
        setAvailableUsers(prev => prev.filter(u => u.id !== requestedUser.id));
        return;
      }

      // Add match request to the database
      const { error: insertError } = await supabase
        .from('match_requests')
        .insert([{
          requester_id: user.id,
          requested_id: requestedUser.id,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (insertError) throw insertError;
      console.log('Match request sent to:', requestedUser.name);

      // Add to swiped set and remove from available users
      setSwiped(prev => new Set([...prev, requestedUser.id]));
      setAvailableUsers(prev => prev.filter(u => u.id !== requestedUser.id));
    } catch (error) {
      console.error('Error sending match request:', error.message);
    }
  };

  const handleCardPress = (user) => {
    setSelectedUser(user);
    setCurrentImageIndex(0);
    setShowGallery(true);
  };

  const renderCard = (user) => {
    if (!user) return null;
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => handleCardPress(user)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: user.images[0] }} style={styles.image} />
        <View style={styles.cardContent}>
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.detailsContainer}>
            <Text style={styles.detail}>👤 {user.gender}</Text>
            <Text style={styles.detail}>📏 {user.height}</Text>
            <Text style={styles.detail}>⚖️ {user.weight}</Text>
            <Text style={styles.detail}>🥋 {user.belt} Belt</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ImageGallery = () => (
    <Modal
      visible={showGallery}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowGallery(false)}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => setShowGallery(false)}
        >
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
        
        <FlatList
          data={selectedUser?.images || []}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={currentImageIndex}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.floor(e.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(newIndex);
          }}
          renderItem={({ item }) => (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </View>
          )}
          keyExtractor={(_, index) => index.toString()}
        />
        
        <View style={styles.paginationDots}>
          {selectedUser?.images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: currentImageIndex === index ? '#fff' : 'rgba(255,255,255,0.5)' }
              ]}
            />
          ))}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {availableUsers.length > 0 ? (
        <Swiper
          cards={availableUsers}
          renderCard={renderCard}
          onSwipedRight={handleSwipeRight}
          onSwipedLeft={(cardIndex) => console.log('Nope')}
          cardIndex={0}
          backgroundColor={'transparent'}
          stackSize={3}
          stackSeparation={15}
          cardVerticalMargin={20}
          cardHorizontalMargin={10}
          animateOverlayLabelsOpacity
          animateCardOpacity
          swipeBackCard
          overlayLabels={{
            left: {
              title: 'NOPE',
              style: {
                label: {
                  backgroundColor: '#FF0000',
                  color: '#fff',
                  fontSize: 24
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: -30
                }
              }
            },
            right: {
              title: 'MATCH',
              style: {
                label: {
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  fontSize: 24
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: 30
                }
              }
            }
          }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No More Profiles</Text>
          <Text style={styles.emptySubtext}>Check back later for new training partners</Text>
        </View>
      )}
      <ImageGallery />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
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
  card: {
    width: width * 0.9,
    height: width * 1.2,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover'
  },
  cardContent: {
    padding: 15
  },
  name: {
    fontSize: 24,
    fontFamily: 'Raleway-Bold',
    marginBottom: 8
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  detail: {
    fontSize: 16,
    fontFamily: 'Raleway-Regular',
    color: '#666',
    marginVertical: 4,
    flexBasis: '48%'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center'
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20
  },
  imageContainer: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullImage: {
    width: width,
    height: height * 0.8
  },
  paginationDots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center'
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4
  }
});