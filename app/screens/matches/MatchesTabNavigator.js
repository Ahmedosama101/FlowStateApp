import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import MatchesTab from './MatchesTab';

const Stack = createStackNavigator();

const UserDetails = ({ route, navigation }) => {
  const { user } = route.params;

  return (
    <SafeAreaView style={styles.detailsContainer} edges={['bottom', 'left', 'right']}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      
      <Image source={{ uri: user.profile_images?.[0]?.image_url || 'https://via.placeholder.com/150' }} style={styles.detailsImage} />

      <Text style={styles.detailsName}>{user.full_name}</Text>

      <View style={styles.detailsRow}>
        <Text style={styles.detailItem}>👤 Gender: {user.gender || 'N/A'}</Text>
        <Text style={styles.detailItem}>📏 Height: {user.height || 'N/A'} cm</Text>
        <Text style={styles.detailItem}>⚖️ Weight: {user.weight || 'N/A'} kg</Text>
        <Text style={styles.detailItem}>🥋 Belt: {user.belt_level || 'N/A'}</Text>
      </View>

      <TouchableOpacity style={styles.sessionButton}>
        <Text style={styles.sessionButtonText}>Send a Session</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default function MatchesTabNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AllMatches" component={MatchesTab} />
      <Stack.Screen name="UserDetails" component={UserDetails} />
    </Stack.Navigator>
  );
}

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
  detailsContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    margin: 10,
  },
  backButtonText: {
    fontSize: 16,
  },
  detailsImage: {
    width: '90%',
    height: '50%',
    marginBottom: 20,
    alignSelf: 'center',
  },
  detailsName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 20,
  },
  detailItem: {
    fontSize: 16,
    marginVertical: 5,
    flexBasis: '45%',
  },
  sessionButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  sessionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});