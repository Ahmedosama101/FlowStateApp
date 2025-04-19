import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import UserWelcome from '../../components/UserWelcome';

const dummyUser = {
  name: null,
  profileImage: null,
};

const upcomingActivity = {
  title: 'BJJ Sparring Session',
  date: 'Saturday, 10:00 AM',
  location: 'Gracie Gym',
};

const matchedUsers = [
  { id: '1', name: 'Alex', age: 25, weight: 75, height: 180, belt: 'Blue' },
  { id: '2', name: 'Chris', age: 30, weight: 68, height: 175, belt: 'Purple' },
  { id: '3', name: 'Jordan', age: 28, weight: 82, height: 185, belt: 'Brown' },
];

const recommendedGyms = [
  { id: '1', name: 'Gracie Gym', location: 'Downtown', hours: '6 AM - 10 PM', image: 'https://images.unsplash.com/photo-1741945939193-0293c3c9e87f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxN3x8fGVufDB8fHx8fA%3D%3D' },
  { id: '2', name: 'Alliance BJJ', location: 'Uptown', hours: '5 AM - 9 PM', image: 'https://images.unsplash.com/photo-1741851373840-15c1af8ca693?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '3', name: '10th Planet', location: 'Midtown', hours: '7 AM - 11 PM', image: 'https://images.unsplash.com/photo-1742827871480-4962b0653e1d?q=80&w=1784&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
];

export default function MainPage({ navigation }) {
  const renderMatchedUserCard = ({ item }) => (
    <View style={styles.userCard}>
      <Icon name="certificate" size={30} color="#000" style={styles.beltIcon} />
      <View style={styles.userInfoContainer}>
        <Text style={styles.userName}>{item.name}</Text>
        <View style={styles.userInfoRowTitles}>
          <Text style={styles.infoTitle}>Age</Text>
          <Text style={styles.infoTitle}>Height</Text>
          <Text style={styles.infoTitle}>Weight</Text>
        </View>
        <View style={styles.userInfoRowValues}>
          <Text style={styles.infoValue}>{item.age}</Text>
          <Text style={styles.infoValue}>{item.height} cm</Text>
          <Text style={styles.infoValue}>{item.weight} kg</Text>
        </View>
      </View>
    </View>
  );

  const renderGymCard = ({ item }) => (
    <View style={styles.gymCard}>
      <Image
        source={item.image ? { uri: item.image } : { uri: 'https://via.placeholder.com/300x150' }}
        style={styles.gymCardImage}
      />
      <View style={styles.gymCardDetails}>
        <Text style={styles.cardText}>{item.name}</Text>
        <Text style={styles.cardText}>{item.location}</Text>
        <Text style={styles.locationLink}>View on Map</Text>
        <Text style={styles.cardText}>{item.hours}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <UserWelcome user={dummyUser} />

      {/* Upcoming Activity Section */}
      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>Upcoming Activity</Text>
        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>{upcomingActivity.title}</Text>
          <Text style={styles.activityDetails}>{upcomingActivity.date}</Text>
          <Text style={styles.activityDetails}>{upcomingActivity.location}</Text>
        </View>
      </View>

      {/* Matched Users Section */}
      <View style={styles.swiperContainer}>
        <Text style={styles.sectionTitle}>Matched Users</Text>
        <FlatList
          horizontal
          data={matchedUsers}
          renderItem={renderMatchedUserCard}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Recommended Gyms Section */}
      <View style={styles.swiperContainer}>
        <Text style={styles.sectionTitle}>Recommended Gyms</Text>
        <FlatList
          horizontal
          data={recommendedGyms}
          renderItem={renderGymCard}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activityContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  activityCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  activityDetails: {
    fontSize: 14,
    color: '#555',
  },
  swiperContainer: {
    marginBottom: 20,
  },
  userCard: {
    width: 200, // Specific width for user cards
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
  },
  gymCard: {
    width: 300, // Specific width for gym cards
    height: 400, // Specific height for gym cards
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 5,
    backgroundColor: '#ddd',
  },
  cardText: {
    fontSize: 16, // Increased font size
    textAlign: 'left',
  },
  gymCardImage: {
    width: '100%',
    height: '60%', // Increased height to occupy more space
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  gymCardDetails: {
    padding: 10,
  },
  beltIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  userInfoContainer: {
    marginLeft: 40, // Align user info to the left
  },
  locationLink: {
    fontSize: 16, // Match font size
    color: 'blue',
    textDecorationLine: 'underline',
  },
  userName: {
    fontSize: 18, // Larger font size for the name
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userInfoRowTitles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 5,
  },
  infoTitle: {
    fontSize: 12, // Smaller font size for titles
    color: '#555',
  },
  userInfoRowValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  infoValue: {
    fontSize: 16, // Larger font size for values
    fontWeight: 'bold',
  },
});