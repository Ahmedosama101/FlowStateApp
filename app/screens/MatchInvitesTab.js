import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

const initialMatchInvites = [
  {
    id: '1',
    sender: {
      id: 'sender1',
      name: 'Sarah',
      image: 'https://via.placeholder.com/150',
      gender: 'Female',
      height: 165,
      weight: 60,
      belt: 'Purple'
    },
    status: 'pending'
  },
  {
    id: '2',
    sender: {
      id: 'sender2',
      name: 'Mike',
      image: 'https://via.placeholder.com/150',
      gender: 'Male',
      height: 180,
      weight: 80,
      belt: 'Blue'
    },
    status: 'pending'
  }
];

const MatchInvitesTab = ({ navigation }) => {
  const [matchInvites, setMatchInvites] = useState(initialMatchInvites);

  const handleAccept = (inviteId) => {
    const acceptedInvite = matchInvites.find(invite => invite.id === inviteId);
    if (acceptedInvite) {
      const newMatch = {
        id: acceptedInvite.sender.id,
        name: acceptedInvite.sender.name,
        image: acceptedInvite.sender.image,
        gender: acceptedInvite.sender.gender,
        height: acceptedInvite.sender.height,
        weight: acceptedInvite.sender.weight,
        belt: acceptedInvite.sender.belt
      };

      setMatchInvites(prev => prev.filter(invite => invite.id !== inviteId));
      
      navigation.navigate('Matches', {
        screen: 'MatchesList',
        params: { newMatch }
      });
    }
  };

  const handleDecline = (inviteId) => {
    setMatchInvites(prev => prev.filter(invite => invite.id !== inviteId));
  };

  const renderInviteCard = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.sender.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.sender.name}</Text>
        <Text>Belt: {item.sender.belt}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAccept(item.id)}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => handleDecline(item.id)}
          >
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {matchInvites.length > 0 ? (
        <FlatList
          data={matchInvites}
          renderItem={renderInviteCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="inbox" size={50} color="#ccc" />
          <Text style={styles.emptyStateText}>No match invites</Text>
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
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
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

export default MatchInvitesTab;