import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

const initialSentRequests = [
  {
    id: '1',
    receiver: {
      id: 'receiver1',
      name: 'Emma',
      image: 'https://via.placeholder.com/150',
      gender: 'Female',
      height: 170,
      weight: 65,
      belt: 'White'
    },
    status: 'pending'
  },
  {
    id: '2',
    receiver: {
      id: 'receiver2',
      name: 'James',
      image: 'https://via.placeholder.com/150',
      gender: 'Male',
      height: 175,
      weight: 75,
      belt: 'Brown'
    },
    status: 'pending'
  }
];

const RequestsTab = () => {
  const [sentRequests, setSentRequests] = useState(initialSentRequests);

  const handleCancel = (requestId) => {
    setSentRequests(prev => prev.filter(request => request.id !== requestId));
  };

  const renderRequestCard = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.receiver.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.receiver.name}</Text>
        <Text>Belt: {item.receiver.belt}</Text>
        <TouchableOpacity 
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => handleCancel(item.id)}
        >
          <Text style={styles.buttonText}>Cancel Request</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {sentRequests.length > 0 ? (
        <FlatList
          data={sentRequests}
          renderItem={renderRequestCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="paper-plane" size={50} color="#ccc" />
          <Text style={styles.emptyStateText}>No sent requests</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 10,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default RequestsTab;