import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, Modal, ScrollView } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';

const Stack = createStackNavigator();
const { width } = Dimensions.get('window');

const DUMMY_GYMS = [
  {
    id: '1',
    name: 'Elite BJJ Academy',
    mainImage: 'https://images.unsplash.com/photo-1507041957456-9c397ce39c97?w=800',
    location: 'Downtown',
    rating: '4.8',
    description: 'Premier Brazilian Jiu-Jitsu training facility with world-class instructors.',
    images: [
      'https://images.unsplash.com/photo-1507041957456-9c397ce39c97?w=800',
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
      'https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?w=800',
      'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800'
    ],
    features: ['Air Conditioning', '24/7 Access', 'Showers', 'Pro Shop'],
    classes: ['Beginner BJJ', 'Advanced BJJ', 'No-Gi', 'Open Mat']
  },
  {
    id: '2',
    name: 'Gracie Combat Center',
    mainImage: 'https://images.unsplash.com/photo-1571388208497-71bedc66e932?w=800',
    location: 'Midtown',
    rating: '4.6',
    description: 'Traditional Gracie Jiu-Jitsu with modern training methods.',
    images: [
      'https://images.unsplash.com/photo-1571388208497-71bedc66e932?w=800',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800',
      'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=800'
    ],
    features: ['Parking', 'Locker Rooms', 'Pro Shop'],
    classes: ['Kids BJJ', 'Adult BJJ', 'Competition Training']
  },
  {
    id: '3',
    name: 'Modern Jiu-Jitsu',
    mainImage: 'https://images.unsplash.com/photo-1559595500-e15296bdbb48?w=800',
    location: 'Westside',
    rating: '4.9',
    description: 'State-of-the-art facility focused on modern competition techniques.',
    images: [
      'https://images.unsplash.com/photo-1559595500-e15296bdbb48?w=800',
      'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
      'https://images.unsplash.com/photo-1570829053985-56e661df1ca2?w=800',
      'https://images.unsplash.com/photo-1574680088814-c9e8a10d8a4d?w=800'
    ],
    features: ['Mat Space', 'Weight Room', 'Recovery Area'],
    classes: ['Competition BJJ', 'Wrestling', 'Strength & Conditioning']
  }
];

function GymsList({ navigation }) {
  const renderGymCard = ({ item }) => (
    <TouchableOpacity
      style={styles.gymCard}
      onPress={() => navigation.navigate('GymDetails', { gym: item })}
    >
      <Image source={{ uri: item.mainImage }} style={styles.gymImage} />
      <View style={styles.gymInfo}>
        <Text style={styles.gymName}>{item.name}</Text>
        <Text style={styles.gymLocation}>{item.location}</Text>
        <Text style={styles.gymRating}>⭐ {item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={DUMMY_GYMS}
      renderItem={renderGymCard}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
    />
  );
}

function GymDetails({ route, navigation }) {
  const { gym } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false);

  const ImageGallery = () => (
    <Modal
      visible={showFullscreenGallery}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowFullscreenGallery(false)}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => setShowFullscreenGallery(false)}
        >
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <FlatList
          data={gym.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={currentImageIndex}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.floor(e.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(newIndex);
          }}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
          keyExtractor={(_, index) => index.toString()}
        />
        <View style={styles.paginationDots}>
          {gym.images.map((_, index) => (
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

  return (
    <ScrollView style={styles.detailsContainer} contentContainerStyle={styles.detailsScrollContent}>
      <TouchableOpacity 
        onPress={() => {
          setCurrentImageIndex(0);
          setShowFullscreenGallery(true);
        }}
      >
        <FlatList
          data={gym.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.detailImage} />
          )}
          keyExtractor={(item, index) => index.toString()}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.floor(e.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(newIndex);
          }}
        />
      </TouchableOpacity>
      
      <View style={styles.imageIndicator}>
        {gym.images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicatorDot,
              { backgroundColor: currentImageIndex === index ? '#007BFF' : '#D1D1D1' }
            ]}
          />
        ))}
      </View>

      <View style={styles.detailsContent}>
        <Text style={styles.detailName}>{gym.name}</Text>
        <Text style={styles.detailLocation}>{gym.location}</Text>
        <Text style={styles.detailRating}>⭐ {gym.rating}</Text>
        
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{gym.description}</Text>
        
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featuresContainer}>
          {gym.features.map((feature, index) => (
            <Text key={index} style={styles.feature}>• {feature}</Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Classes</Text>
        <View style={styles.classesContainer}>
          {gym.classes.map((className, index) => (
            <Text key={index} style={styles.className}>• {className}</Text>
          ))}
        </View>
      </View>
      <ImageGallery />
    </ScrollView>
  );
}

export default function GymsTab() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GymsList" component={GymsList} />
      <Stack.Screen name="GymDetails" component={GymDetails} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000'
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10
  },
  fullscreenImage: {
    width: width,
    height: '100%'
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
  },
  imageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3
  },
  listContainer: {
    padding: 15,
  },
  gymCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gymImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  gymInfo: {
    padding: 15,
  },
  gymName: {
    fontSize: 20,
    fontFamily: 'Raleway-Bold',
    marginBottom: 5,
  },
  gymLocation: {
    fontSize: 16,
    fontFamily: 'Raleway-Regular',
    color: '#666',
    marginBottom: 5,
  },
  gymRating: {
    fontSize: 16,
    fontFamily: 'Raleway-Medium',
    color: '#FFD700',
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  detailsScrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  detailImage: {
    width: width,
    height: width * 0.75,
  },
  detailsContent: {
    flex: 1,
    padding: 20,
  },
  detailName: {
    fontSize: 24,
    fontFamily: 'Raleway-Bold',
    marginBottom: 5,
  },
  detailLocation: {
    fontSize: 18,
    fontFamily: 'Raleway-Regular',
    color: '#666',
    marginBottom: 5,
  },
  detailRating: {
    fontSize: 18,
    fontFamily: 'Raleway-Medium',
    color: '#FFD700',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Raleway-Bold',
    marginTop: 15,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Raleway-Regular',
    color: '#444',
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 15,
  },
  feature: {
    fontSize: 16,
    fontFamily: 'Raleway-Regular',
    color: '#444',
    marginBottom: 5,
  },
  classesContainer: {
    marginBottom: 15,
  },
  className: {
    fontSize: 16,
    fontFamily: 'Raleway-Regular',
    color: '#444',
    marginBottom: 5,
  },
});