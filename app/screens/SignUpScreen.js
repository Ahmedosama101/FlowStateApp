import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useFonts } from 'expo-font';

export default function SignUpScreen ({navigation}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fontsLoaded] = useFonts({
    'Raleway-Regular': require('../assets/fonts/Raleway-Regular.ttf'),
    'Raleway-Medium': require('../assets/fonts/Raleway-Medium.ttf'),
    'Raleway-Bold': require('../assets/fonts/Raleway-Bold.ttf'),
  });
  const handleSignUp = () => {
    // Handle sign-up logic here
    console.log('Signing up with:', fullName, email, password);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.subtitle}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </Text>

{/* Input section */}
        <View style={{ marginHorizontal: 25 }}>
        <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />
                  <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
    <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />            
      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
        </View>

      <Text style={styles.terms}>
        By continuing, you agree to <Text style={styles.innerText}> Terms of Use</Text> and <Text style={styles.innerText}> Privacy Policy</Text>.
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Gender')}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.or}>or sign up with</Text>
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

      <Text style={styles.haveAccountText}>
        Already have an account?{' '}
        <Text style={styles.loginText} onPress={() => navigation.navigate('Login')}>
          Log in
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff', // Set background color to white
  },
  title: {
    fontSize: 40,
    fontFamily: 'Raleway-Bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Raleway-Regular',
    color: 'gray',
    marginBottom: 50,
    marginHorizontal: 25,
    textAlign: 'center'
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
    fontFamily: 'Raleway-Regular',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Raleway-Regular',
    marginBottom:10,
  },
  terms: {
    fontSize: 12,
    fontFamily: 'Raleway-Regular',
    color: '391713',
    marginBottom: 20,
    textAlign: 'center',
    marginHorizontal:90,
  },
  innerText:{
fontFamily:'Raleway-Bold',
  },
  button: {
    backgroundColor: 'white', // Set button background to white
    borderWidth: 2, // Add border
    borderColor: 'black', // Set border color to black
    borderRadius: 25,
    padding: 10,
    alignItems: 'center',
    marginBottom: 30,
    marginHorizontal: 90,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Raleway-Bold',
  },
  or: {
    textAlign: 'center',
    marginBottom: 10,
    color: 'gray',
    fontFamily: 'Raleway-Regular',
fontSize:14,
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
  haveAccountText: {
    textAlign: 'center',
    color: '#888',
    fontFamily: 'Raleway-Regular',
  },
  loginText: {
    color: 'black',
    fontWeight: 'bold',
    fontFamily: 'Raleway-Regular',
  },
});

