import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { supabase } from '../../lib/supabase';

export default function UserDetailsScreen({ route, navigation }) {
  const { user } = route.params;
  const [profileImage, setProfileImage] = useState(null);
  
  useEffect(() => {
    // If user already has a primary image URL from previous screen, use it
    if (user.primaryImageUrl) {
      setProfileImage(user.primaryImageUrl);
      return;
    }
    
    // Otherwise fetch it from the database
    const fetchProfileImage = async () => {
      try {
        const { data, error } = await supabase
          .from('profile_images')
          .select('image_url')
          .eq('profile_id', user.id)
          .eq('is_primary', true)
          .single();
          
        if (error) {
          console.error('Error fetching profile image:', error);
          return;
        }
        
        if (data) {
          setProfileImage(data.image_url);
        }
      } catch (error) {
        console.error('Error in fetchProfileImage:', error);
      }
    };
    
    fetchProfileImage();
  }, [user.id]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.profileCard}>        <Image 
            source={{ uri: profileImage || user.profile_images?.[0]?.image_url || 'https://via.placeholder.com/150' }} 
            style={styles.profileImage}
          />
          
          <Text style={styles.userName}>{user.full_name}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="balance-scale" size={16} color="#333" />
              <Text style={styles.statText}>{user.weight_min || user.weight} - {user.weight_max || user.weight} KG</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Icon name="arrows-v" size={16} color="#333" />
              <Text style={styles.statText}>{user.height} CM</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Icon name="user" size={16} color="#333" />
              <Text style={styles.statText}>{user.gender}</Text>
            </View>
          </View>
          
          <View style={styles.beltContainer}>
            <View style={[styles.beltIndicator, {backgroundColor: user.belt_color || getBeltColor(user.belt_level)}]} />
            <Text style={styles.beltText}>{user.belt_level || 'Brown'}</Text>
          </View>
            <TouchableOpacity 
            style={styles.sessionButton}
            onPress={() => navigation.navigate('SessionInvite', {
              partnerId: user.id,
              partnerName: user.full_name,
              partnerImage: profileImage || user.profile_images?.[0]?.image_url || 'https://via.placeholder.com/150'
            })}
          >
            <Text style={styles.sessionButtonText}>Send session invite</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to convert belt level to color
function getBeltColor(beltLevel) {
  if (!beltLevel) return '#8B4513'; // Default brown
  
  const beltMap = {
    'white': '#FFFFFF',
    'blue': '#0000FF',
    'purple': '#800080',
    'brown': '#8B4513',
    'black': '#000000'
  };
  
  const lowerBelt = beltLevel.toLowerCase();
  for (const [belt, color] of Object.entries(beltMap)) {
    if (lowerBelt.includes(belt)) return color;
  }
  
  return '#8B4513'; // Default to brown
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 180,
    height: 180,
    borderRadius: 12,
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Raleway-Bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    marginVertical: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    fontFamily: 'Raleway-Medium',
    marginLeft: 6,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#DDD',
    marginHorizontal: 12,
  },
  beltContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  beltIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  beltText: {
    fontSize: 14,
    fontFamily: 'Raleway-Medium',
  },
  sessionButton: {
    backgroundColor: '#1E3A8A',
    width: '100%',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  sessionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
  },
});