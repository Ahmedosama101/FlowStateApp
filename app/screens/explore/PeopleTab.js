import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Modal, FlatList } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

const DUMMY_USERS = [
  {
    id: '1',
    name: 'Sarah Johnson',
    images: [
      'https://images.unsplash.com/photo-1617170508836-e11d8487cd94?w=800',
      'https://images.unsplash.com/photo-1617170508832-a72d93d16235?w=800',
      'https://images.unsplash.com/photo-1617170508825-26b0d40d7df7?w=800'
    ],
    gender: 'Female',
    height: '165 cm',
    weight: '60 kg',
    belt: 'Purple'
  },
  {
    id: '2',
    name: 'Mike Chen',
    images: [
      'https://images.unsplash.com/photo-1620094349746-f4cee1bee7cc?w=800',
      'https://images.unsplash.com/photo-1620094344416-9eec6601389c?w=800',
      'https://images.unsplash.com/photo-1620094347675-19ed04e9c8ec?w=800'
    ],
    gender: 'Male',
    height: '180 cm',
    weight: '75 kg',
    belt: 'Blue'
  },
  {
    id: '3',
    name: 'Alex Silva',
    images: [
      'https://images.unsplash.com/photo-1624936188350-883a61a44330?w=800',
      'https://images.unsplash.com/photo-1624936188356-22a502be85fb?w=800',
      'https://images.unsplash.com/photo-1624936188342-1a40aa746717?w=800'
    ],
    gender: 'Male',
    height: '175 cm',
    weight: '70 kg',
    belt: 'Brown'
  }
];

export default function PeopleTab({ navigation }) {
  const [users] = useState(DUMMY_USERS);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleSwipeRight = (cardIndex) => {
    const requestedUser = users[cardIndex];
    console.log('Requested match with:', requestedUser.name);
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
            <Image
              source={{ uri: item }}
              style={styles.fullImage}
              resizeMode="contain"
            />
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

  return (
    <View style={styles.container}>
      <Swiper
        cards={users}
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
      <ImageGallery />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
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
    backgroundColor: '#000'
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10
  },
  fullImage: {
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
  }
});