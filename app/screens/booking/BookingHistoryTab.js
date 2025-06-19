import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';

const Stack = createStackNavigator();

// Dummy data for booking history
const dummyHistory = [
  {
    id: '1',
    partner: 'James Brown',
    location: 'Elite BJJ Academy',
    date: '2025-04-15',
    time: '11:00 AM',
    notes: 'Great rolling session',
    rating: 5,
  },
  {
    id: '2',
    partner: 'Emma Davis',
    location: 'Gracie Combat Center',
    date: '2025-04-10',
    time: '3:00 PM',
    notes: 'Worked on guard passes',
    rating: 4,
  },
  {
    id: '3',
    partner: 'David Lee',
    location: 'Modern Jiu-Jitsu',
    date: '2025-04-05',
    time: '2:00 PM',
    notes: 'Competition preparation',
    rating: 5,
  },
];

function HistoryCard({ booking, onPress }) {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Icon
        key={index}
        name={index < rating ? 'star' : 'star-o'}
        size={16}
        color={index < rating ? '#FFD700' : '#666'}
      />
    ));
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.partnerName}>{booking.partner}</Text>
        <View style={styles.ratingContainer}>
          {renderStars(booking.rating)}
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Icon name="map-marker" size={16} color="#666" />
          <Text style={styles.detailText}>{booking.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>{booking.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="clock-o" size={16} color="#666" />
          <Text style={styles.detailText}>{booking.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function HistoryDetailScreen({ route, navigation }) {
  const { booking } = route.params;

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Icon
        key={index}
        name={index < rating ? 'star' : 'star-o'}
        size={24}
        color={index < rating ? '#FFD700' : '#666'}
        style={{ marginRight: 8 }}
      />
    ));
  };

  return (
    <ScrollView style={styles.detailContainer} contentContainerStyle={styles.detailScrollContent}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Icon name="chevron-left" size={20} color="#33363F" />
      </TouchableOpacity>

      <Text style={styles.detailTitle}>Session Details</Text>
      
      <View style={styles.detailContent}>
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Partner</Text>
          <Text style={styles.sectionContent}>{booking.partner}</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.sectionContent}>{booking.location}</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <Text style={styles.sectionContent}>{booking.date} at {booking.time}</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Rating</Text>
          <View style={styles.ratingContainer}>
            {renderStars(booking.rating)}
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.sectionContent}>{booking.notes}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function HistoryList({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Add your data fetching logic here
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const renderBooking = ({ item }) => (
    <HistoryCard
      booking={item}
      onPress={() => navigation.navigate('HistoryDetail', { booking: item })}
    />
  );

  return (
    <FlatList
      data={dummyHistory}
      renderItem={renderBooking}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

export default function BookingHistoryTab() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HistoryList" component={HistoryList} />
      <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  detailScrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  backButton: {
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 18,
    color: '#333',
  },
});