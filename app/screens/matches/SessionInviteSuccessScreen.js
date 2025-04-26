import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function SessionInviteSuccessScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="check-circle" size={80} color="#4CAF50" />
        </View>
        <Text style={styles.title}>Session Invite Sent!</Text>
        <Text style={styles.message}>
          Your training session invite has been sent successfully. You'll be notified when they respond.
        </Text>
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => navigation.navigate('MainTab')}
        >
          <Text style={styles.homeButtonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Raleway-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: 'Raleway-Regular',
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  homeButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    textAlign: 'center',
  },
});