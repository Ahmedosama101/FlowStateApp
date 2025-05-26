import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, Image, View, Text, StyleSheet, TextInput, SafeAreaView, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { supabase } from '../lib/supabase';  // Fixed import path

SplashScreen.preventAutoHideAsync();

export default function LoginScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (!data?.user) {
        throw new Error('No user returned from login');
      }

      // Check if profile exists and is complete
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        // If profile doesn't exist at all, create it and send to onboarding
        if (profileError.code === 'PGRST116') {
          // Create empty profile
          const { error: createError } = await supabase
            .from('profiles')
            .insert([{ 
              id: data.user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);
            
          if (createError) throw createError;
          
          navigation.reset({
            index: 0,
            routes: [{ name: 'Gender' }],
          });
          return;
        }
        throw profileError;
      }

      // Check if ANY required profile field is missing or null
      const isProfileIncomplete = !profileData.gender || 
                                !profileData.date_of_birth || 
                                !profileData.weight || 
                                !profileData.height ||
                                !profileData.belt;

                                if (isProfileIncomplete) {
                                  // Define required fields in order of the profile flow
                                  const requiredFields = [
                                    { field: 'gender', screen: 'Gender' },
                                    { field: 'date_of_birth', screen: 'DateOfBirth' },
                                    { field: 'weight', screen: 'Weight' },
                                    { field: 'height', screen: 'Height' },
                                    { field: 'belt_level', screen: 'Belt' },
                                    { field: 'country', screen: 'Address' },
                                  ];
                                
                                  // Find the first missing field (if any)
                                  const missingField = requiredFields.find(({ field }) => !profileData[field]);
                                
                                  const nextScreen = missingField ? missingField.screen : 'Main';
                                
                                  navigation.reset({
                                    index: 0,
                                    routes: [{ name: nextScreen }],
                                  });
                                } else {
        // Profile is complete, go to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const [fontsLoaded] = useFonts({
    'Raleway-Regular': require('../assets/fonts/Raleway-Regular.ttf'),
    'Raleway-Medium': require('../assets/fonts/Raleway-Medium.ttf'),
    'Raleway-Bold': require('../assets/fonts/Raleway-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null; // Prevent rendering until fonts are loaded
  }

  SplashScreen.hideAsync();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.descriptionText}>
              Login to continue your journey in finding the perfect training partner.
            </Text>

            {/* Input section */}
            <View style={{ marginHorizontal: 25 }}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="example@example.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="********"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                />
              </View>
              <TouchableOpacity style={styles.forgotPasswordButton}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>or sign up with</Text>

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Image style={{color:'white'}} source={require('../assets/Gmail.png')} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Image style={{ bord:'white'}} source={require('../assets/Facebook.png')} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Image style={{color:'white'}} source={require('../assets/Mark.png')} />
              </TouchableOpacity>
            </View>

            <View style={styles.signUpContainer}>
              <Text style={styles.noAccountText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signUpText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 40,
    fontFamily: 'Raleway-Bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Raleway-Regular',
    color: '#888',
    textAlign: 'center',
    marginHorizontal: 25,
    marginBottom: 80,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
    fontFamily: 'Raleway-Bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Raleway-Regular',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 50,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Raleway-Bold',
  },
  loginButton: {
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 30,
    marginHorizontal: 90,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    fontSize: 18,
    fontFamily: 'Raleway-Bold',
  },
  orText: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#888',
    fontFamily: 'Raleway-Regular',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 13.13,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 9,
  },
  socialButtonText: {
    color: 'white',
    fontSize: 22,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  noAccountText: {
    marginRight: 5,
    color: '#888',
    fontFamily: 'Raleway-Regular',
  },
  signUpText: {
    color: 'black',
    fontWeight: 'bold',
    fontFamily: 'Raleway-Regular',
  },
});
