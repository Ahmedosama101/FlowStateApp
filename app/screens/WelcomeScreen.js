import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {Image, View, Text, StyleSheet, TextInput, SafeAreaView, TouchableOpacity } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();
export default function LoginScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
    <SafeAreaView style={styles.container}>
      {/* Welcome section */}
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome Back</Text>
        <Text style={styles.descriptionText}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
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
              secureTextEntry
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
            />
          </View>
          <TouchableOpacity style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Macthes')}>
          <Text style={styles.loginButtonText}>Log In</Text>
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
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
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
