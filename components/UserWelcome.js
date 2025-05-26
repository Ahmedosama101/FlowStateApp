import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { supabase } from '../app/lib/supabase';

const UserWelcome = () => {
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          if (data) {
            setUserName(data.full_name || 'User');
          }
        }
      } catch (error) {
        console.error('Error fetching user name:', error.message);
      }
    };

    fetchUserName();
  }, []);

  return (
    <View style={[styles.headerContainer, styles.userWelcomeContainer]}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1744132116978-bbf797a1e689?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
        style={styles.profileImage}
      />
      <Text style={styles.welcomeText}>
        Welcome {userName}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userWelcomeContainer: {
    paddingLeft: 20, // Left padding specifically for UserWelcome
  },
});

export default UserWelcome;