import React from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MatchesTab = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Matches Tab</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MatchesTab;