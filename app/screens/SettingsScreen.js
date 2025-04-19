import * as React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

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

function LogoutButton({ text }) {
  return (
    <View style={styles.buttonContainer}>
      <Text>{text}</Text>
    </View>
  );
}

function SettingsScreen({ navigation }) {
  const supportOptions = [
    { text: 'Report an issue', uri: 'https://cdn.builder.io/api/v1/image/assets/TEMP/c6efd9a410d0e845982ee90f5c5b0520173e2273ceb7305ee79827c1e5d7a198' },
    { text: 'FAQs', uri: 'https://cdn.builder.io/api/v1/image/assets/TEMP/c6efd9a410d0e845982ee90f5c5b0520173e2273ceb7305ee79827c1e5d7a198' },
  ];
  
  return (
    <View style={styles.container}>
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
        <LogoutButton text="Logout" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 480,
    width: '100%',
    paddingBottom: 21,
    flexDirection: 'column',
    overflow: 'hidden',
    alignItems: 'stretch',
    fontFamily: 'Inter, sans-serif',
    color: '#000',
    textTransform: 'capitalize',
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
    marginTop: 152,
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
