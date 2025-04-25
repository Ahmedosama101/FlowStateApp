import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

const MatchInvitesTab = () => {
  const [invites, setInvites] = useState([]);

  const renderInvite = ({ item }) => (
    <TouchableOpacity style={styles.inviteContainer}>
      <Image source={{ uri: item.image }} style={styles.inviteImage} />
      <View style={styles.inviteDetails}>
        <Text style={styles.inviteName}>{item.name}</Text>
        <Text style={styles.inviteMessage}>{item.message}</Text>
      </View>
      <Icon name="chevron-right" size={20} color="#000" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={invites}
        renderItem={renderInvite}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>No invites available</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inviteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  inviteImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  inviteDetails: {
    flex: 1,
  },
  inviteName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inviteMessage: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
});

export default MatchInvitesTab;