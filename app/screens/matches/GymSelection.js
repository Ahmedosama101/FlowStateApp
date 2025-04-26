import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { supabase } from '../../lib/supabase';

export default function GymSelection({ navigation, route }) {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { onSelect } = route.params;

  useEffect(() => {
    fetchGyms();
  }, []);

  const fetchGyms = async () => {
    try {
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .order('name');

      if (error) throw error;
      setGyms(data || []);
    } catch (error) {
      console.error('Error fetching gyms:', error);
      Alert.alert('Error', 'Failed to load gyms');
    } finally {
      setLoading(false);
    }
  };

  const handleGymSelect = (gym) => {
    onSelect(gym);
  };

  const renderGym = ({ item }) => (
    <TouchableOpacity
      style={styles.gymItem}
      onPress={() => handleGymSelect(item)}
    >
      <View style={styles.gymInfo}>
        <Text style={styles.gymName}>{item.name}</Text>
        <Text style={styles.gymAddress}>{item.address}</Text>
      </View>
      <Icon name="chevron-right" size={16} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Gym</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading gyms...</Text>
        </View>
      ) : (
        <FlatList
          data={gyms}
          renderItem={renderGym}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Raleway-Bold',
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  gymItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  gymInfo: {
    flex: 1,
  },
  gymName: {
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    color: '#333',
    marginBottom: 4,
  },
  gymAddress: {
    fontSize: 14,
    fontFamily: 'Raleway-Regular',
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
});