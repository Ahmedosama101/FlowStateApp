import * as React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { supabase } from '../lib/supabase';

function SettingsOption({ text, imageUri }) {
  return (
    <View style={styles.optionContainer}>
      <View style={styles.textContainer}>
        <Text>{text}</Text>
      </View>
      <Image resizeMode="contain" source={{ uri: imageUri }} style={styles.optionImage} />
    </View>
  );
}

function SupportOption({ text, imageUri }) {
  return (
    <View style={styles.optionContainer}>
      <View style={styles.textContainer}>
        <Text>{text}</Text>
      </View>
      <Image resizeMode="contain" source={{ uri: imageUri }} style={styles.optionImage} />
    </View>
  );
}

function LogoutButton({ text, onPress }) {
  return (
    <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
      <Text>{text}</Text>
    </TouchableOpacity>
  );
}

function SettingsScreen({ navigation }) {
  const supportOptions = [
    { text: 'Report an issue', uri: 'https://cdn.builder.io/api/v1/image/assets/TEMP/c6efd9a410d0e845982ee90f5c5b0520173e2273ceb7305ee79827c1e5d7a198' },
    { text: 'FAQs', uri: 'https://cdn.builder.io/api/v1/image/assets/TEMP/c6efd9a410d0e845982ee90f5c5b0520173e2273ceb7305ee79827c1e5d7a198' },
  ];
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      alert('Error logging out: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Image
            resizeMode="contain"
            source={{ uri: 'https://cdn.builder.io/api/v1/image/assets/TEMP/ae214b6455abf99f6088d70155089396a6350c60df84f4f10678c7907c8706cb' }}
            style={styles.headerImage}
          />
          <View style={styles.headerTextContainer}>
            <Text>Settings</Text>
          </View>
        </View>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>General</Text>
          <SettingsOption text="Account Information" imageUri="https://cdn.builder.io/api/v1/image/assets/TEMP/cf8866582bd383b76e6779e2802aba86bcbb5e971d546742a2478e2aa152951c" />
          <View style={styles.separator}/>
          <SettingsOption text="Address Information" imageUri="https://cdn.builder.io/api/v1/image/assets/TEMP/cf8866582bd383b76e6779e2802aba86bcbb5e971d546742a2478e2aa152951c" />
          <View style={styles.separator}/>
          <SettingsOption text="Payment Information" imageUri="https://cdn.builder.io/api/v1/image/assets/TEMP/cf8866582bd383b76e6779e2802aba86bcbb5e971d546742a2478e2aa152951c" />
          <View style={styles.separator}/>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.supportContainer}>
            {supportOptions.map((option, index) => (
              <React.Fragment key={index}>
                <SupportOption text={option.text} imageUri={option.uri} />
                {index < supportOptions.length - 1 && <View style={styles.supportSeparator}/>} 
              </React.Fragment>
            ))}
          </View>
          <LogoutButton text="Logout" onPress={handleLogout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100, // Extra padding at the bottom to ensure visibility
  },
  header: {
    backgroundColor: '#F2F2F7',
    paddingLeft: 22,
    paddingRight: 80,
    paddingTop: 31,
    paddingBottom: 31,
  },
  headerImage: {
    width: 24,
    aspectRatio: 1,
  },
  headerTextContainer: {
    marginTop: 56,
    marginLeft: 15,
  },
  content: {
    marginTop: 26,
    paddingLeft: 33,
    paddingRight: 33,
  },
  sectionTitle: {
    fontWeight: '700',
    marginTop: 37,
  },
  separator: {
    backgroundColor: '#E5E5EA',
    height: 1,
    marginTop: 13,
  },
  supportContainer: {
    marginTop: 28,
  },
  supportSeparator: {
    backgroundColor: '#E5E5EA',
    height: 1,
    marginTop: 10,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  textContainer: {
    width: 182,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  optionImage: {
    width: 24,
    aspectRatio: 1,
  },
  buttonContainer: {
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: '#F2F2F7',
    backgroundColor: '#D1D1D6',
    alignSelf: 'center',
    marginTop: 40, // Reduced from 152 to 40
    marginBottom: 30, // Added bottom margin
    width: '100%',
    maxWidth: 311,
    paddingVertical: 14,
    paddingHorizontal: 70,
    fontFamily: 'Raleway, sans-serif',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default SettingsScreen;
