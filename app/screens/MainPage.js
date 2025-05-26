import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Paragraph, Avatar, Button, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons'; // Import MaterialIcons for icons
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
    <Card style={styles.card}>
      <Card.Title
        title={item.name}
        subtitle={`Belt: ${item.belt}`}
        left={(props) => <Avatar.Text {...props} label={item.name[0]} />}
      />
      <Card.Content>
        <Paragraph>Age: {item.age}</Paragraph>
        <Paragraph>Height: {item.height} cm</Paragraph>
        <Paragraph>Weight: {item.weight} kg</Paragraph>
      </Card.Content>
    </Card>
  );

  const renderGymCard = ({ item }) => (
    <Card style={styles.card}>
      <Card.Cover source={{ uri: item.image }} />
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>{item.location}</Paragraph>
        <Paragraph>Hours: {item.hours}</Paragraph>
      </Card.Content>
      <Card.Actions style={styles.cardActions}> {/* Adjusted styling for proper alignment */}
        <Button
          icon={() => <MaterialIcons name="map" size={20} color="#0C2252" />} // Added icon
          onPress={() => navigation.navigate('MapScreen', { location: item.location })}
        >
          View on Map
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <UserWelcome user={dummyUser} />

      {/* Upcoming Activity Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Upcoming Activity</Title>
          <Paragraph>{upcomingActivity.title}</Paragraph>
          <Paragraph>{upcomingActivity.date}</Paragraph>
          <Paragraph>{upcomingActivity.location}</Paragraph>
        </Card.Content>
      </Card>

      {/* Matched Users Section */}
      <Text style={styles.sectionTitle}>Matched Users</Text>
      <FlatList
        horizontal
        data={matchedUsers}
        renderItem={renderMatchedUserCard}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
      />

      {/* Recommended Gyms Section */}
      <Text style={styles.sectionTitle}>Recommended Gyms</Text>
      <FlatList
        horizontal
        data={recommendedGyms}
        renderItem={renderGymCard}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  card: {
    marginBottom: 20,
    marginRight: 10,
    width: 300,
  },
  cardActions: {
    justifyContent: 'flex-end', // Align actions properly within the card
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#0C2252', // Updated color to match system design
  },
});