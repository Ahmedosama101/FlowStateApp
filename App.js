import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { supabase } from './app/lib/supabase';
import AuthNavigator from './app/navigation/AuthNavigator';
import MainNavigator from './app/navigation/MainNavigator';
import { View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { SessionProvider } from './app/context/SessionContext';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    'Raleway-Regular': require('./app/assets/fonts/Raleway-Regular.ttf'),
    'Raleway-Medium': require('./app/assets/fonts/Raleway-Medium.ttf'),
    'Raleway-Bold': require('./app/assets/fonts/Raleway-Bold.ttf'),
  });

  useEffect(() => {
    console.log('Initializing app...'); // Debug log

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error fetching session:', error.message); // Debug log
      } else {
        console.log('Session fetched successfully:', session); // Debug log
      }
      setSession(session);
      setLoading(false);
    }).catch((err) => {
      console.error('Unexpected error fetching session:', err); // Debug log
      setLoading(false); // Ensure loading state is cleared
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed. New session:', session); // Debug log
      setSession(session);
    });

    return () => {
      console.log('Cleaning up auth state change subscription...'); // Debug log
      subscription.unsubscribe();
    };
  }, []);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SessionProvider>
      <NavigationContainer>
        {session ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </SessionProvider>
  );
}
