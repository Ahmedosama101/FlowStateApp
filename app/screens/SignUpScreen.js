import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useFonts } from 'expo-font';
import { supabase } from '../lib/supabase';
import { Dropdown } from 'react-native-element-dropdown';
import { Ionicons } from '@expo/vector-icons';
import MaskInput from 'react-native-mask-input';

export default function SignUpScreen({navigation}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('QA');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const countries = [
    { label: 'Qatar', value: 'QA', mask: ['+', '9', '7', '4', ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/] },
    { label: 'Canada', value: 'CA', mask: ['+', '1', ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/] },
    { label: 'United Kingdom', value: 'GB', mask: ['+', '4', '4', ' ', /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/] }
  ];

  const [fontsLoaded] = useFonts({
    'Raleway-Regular': require('../assets/fonts/Raleway-Regular.ttf'),
    'Raleway-Medium': require('../assets/fonts/Raleway-Medium.ttf'),
    'Raleway-Bold': require('../assets/fonts/Raleway-Bold.ttf'),
  });

  const validatePassword = (pass) => {
    if (!pass) return { isValid: false, errors: ['Password is required'] };

    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const isLongEnough = pass.length >= 8;

    const errors = [];
    if (!hasUpper) errors.push('1 uppercase letter');
    if (!hasLower) errors.push('1 lowercase letter');
    if (!hasNumber) errors.push('1 number');
    if (!hasSpecial) errors.push('1 special character (!@#$%^&*(),.?":{}|<>)');
    if (!isLongEnough) errors.push('minimum 8 characters');

    return {
      isValid: hasUpper && hasLower && hasNumber && hasSpecial && isLongEnough,
      errors,
      strengths: {
        hasUpper,
        hasLower,
        hasNumber,
        hasSpecial,
        isLongEnough
      }
    };
  };

  const validateForm = () => {
    if (!fullName || !email || !password || !confirmPassword || !phoneNumber || !country) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      Alert.alert('Invalid Password', 
        'Password must contain:\n• ' + passwordValidation.errors.join('\n• '));
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (phoneNumber.replace(/\D/g, '').length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Sign up with email verification and include phone number in metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
            country: country
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data?.user) {
        // Create the profile with phone number
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id,
              full_name: fullName,
              phone_number: phoneNumber,
              country: country,
              created_at: new Date(),
              updated_at: new Date()
            }
          ]);

        if (profileError) throw profileError;

        Alert.alert(
          'Success',
          'Please check your email for verification link. Once verified, you can log in.',
          [{ 
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (text.length > 0) {
      const validation = validatePassword(text);
      if (!validation.isValid) {
        Alert.alert(
          'Password Requirements', 
          'Your password must contain:\n• ' + validation.errors.join('\n• '),
          [{ text: 'OK', onPress: () => {} }]
        );
      }
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        )}
        
        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>
          Join FlowState to connect with training partners and find the perfect gym.
        </Text>

        <View style={{ marginHorizontal: 25 }}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            editable={!loading}
          />

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneContainer}>
            <Dropdown
              style={styles.countryDropdown}
              data={countries}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Country"
              value={country}
              onChange={item => setCountry(item.value)}
              disable={loading}
            />
            <MaskInput
              style={styles.phoneInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              mask={countries.find(c => c.value === country)?.mask || []}
              keyboardType="phone-pad"
              placeholder="Phone Number"
              editable={!loading}
            />
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 0, borderWidth: 0 }]}
              placeholder="Password"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity 
              style={styles.passwordVisibilityButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? 'eye' : 'eye-off'} 
                size={24} 
                color="black" 
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 0, borderWidth: 0 }]}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity 
              style={styles.passwordVisibilityButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons 
                name={showConfirmPassword ? 'eye' : 'eye-off'} 
                size={24} 
                color="black" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.terms}>
          By continuing, you agree to <Text style={styles.innerText}> Terms of Use</Text> and <Text style={styles.innerText}> Privacy Policy</Text>.
        </Text>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Sign Up'}</Text>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Set background color to white
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
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
  buttonDisabled: {
    opacity: 0.5,
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
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  phoneInputContainer: {
    width: '100%',
    borderRadius: 8,
    marginBottom: 10,
  },
  phoneInputText: {
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  passwordVisibilityButton: {
    padding: 10,
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
  },
  countryDropdown: {
    flex: 2,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  phoneInput: {
    flex: 3,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Raleway-Regular',
  },
});

