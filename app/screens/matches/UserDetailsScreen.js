import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function UserDetailsScreen({ route, navigation }) {
  const { user } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        <Image 
          source={{ uri: user.profile_images?.[0]?.image_url || 'https://via.placeholder.com/150' }} 
          style={styles.profileImage}
        />

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.full_name}</Text>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Icon name="user" size={20} color="#007BFF" />
              <Text style={styles.detailLabel}>Gender</Text>
              <Text style={styles.detailValue}>{user.gender}</Text>
            </View>

            <View style={styles.detailItem}>
              <Icon name="arrows-v" size={20} color="#007BFF" />
              <Text style={styles.detailLabel}>Height</Text>
              <Text style={styles.detailValue}>{user.height} cm</Text>
            </View>

            <View style={styles.detailItem}>
              <Icon name="balance-scale" size={20} color="#007BFF" />
              <Text style={styles.detailLabel}>Weight</Text>
              <Text style={styles.detailValue}>{user.weight} kg</Text>
            </View>

            <View style={styles.detailItem}>
              <Icon name="black-tie" size={20} color="#007BFF" />
              <Text style={styles.detailLabel}>Belt</Text>
              <Text style={styles.detailValue}>{user.belt_level}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.sessionButton}
          onPress={() => navigation.navigate('SessionInvite', { user })}
        >
          <Text style={styles.sessionButtonText}>Send Session Invite</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 16,
  },
  profileImage: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  userInfo: {
    padding: 20,
  },
  userName: {
    fontSize: 28,
    fontFamily: 'Raleway-Bold',
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -10,
  },
  detailItem: {
    width: '50%',
    padding: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Raleway-Regular',
    color: '#666',
    marginTop: 8,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    marginTop: 4,
  },
  sessionButton: {
    backgroundColor: '#007BFF',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sessionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
  },
});