import React, { useEffect, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { SessionContext } from '../context/SessionContext';

const UserDataRetrievalScreen = ({ navigation }) => {
  const { setUser } = useContext(SessionContext); // Access setUser from SessionContext

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get the current session
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
          console.error('No active session or user not logged in:', sessionError);
          return;
        }

        const userId = session.user.id;

        // Fetch user data from the profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('Error fetching profile data:', profileError);
          return;
        }

        // Store user data in SessionContext
        setUser(profileData);

        // Navigate to the next screen (e.g., MainPage)
        navigation.replace('MainPage');
      } catch (err) {
        console.error('Unexpected error fetching user data:', err);
      }
    };

    fetchUserData();
  }, [navigation, setUser]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text>Loading user data...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default UserDataRetrievalScreen;