import React from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const dummyMatchedUsers = [
  { id: '1', name: 'Alex', image: 'https://via.placeholder.com/150' },
  { id: '2', name: 'Chris', image: 'https://via.placeholder.com/150' },
  { id: '3', name: 'Jordan', image: 'https://via.placeholder.com/150' },
  { id: '4', name: 'Taylor', image: 'https://via.placeholder.com/150' },
];

const MatchesTab = ({ navigation }) => {
  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('UserDetails', { user: item })}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <Text style={styles.cardName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={dummyMatchedUsers}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
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
    flex: 1,
    margin: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    overflow: 'hidden',
    maxWidth: Dimensions.get('window').width / 2 - 30,
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardName: {
    padding: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MatchesTab;