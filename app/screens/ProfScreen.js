import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker'; // For image upload and camera
import { useFonts } from 'expo-font';

export default function ProfScreen({ navigation }) {
    const [profileImage, setProfileImage] = useState(null);
    const [aboutMe, setAboutMe] = useState('');

    const handleContinue = () => {
        // Here we complete the auth flow and move to main app
        if (profileImage && aboutMe) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
        } else {
            alert("Please complete your profile setup.");
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const [fontsLoaded] = useFonts({
        'Raleway-Regular': require('../assets/fonts/Raleway-Regular.ttf'),
        'Raleway-Medium': require('../assets/fonts/Raleway-Medium.ttf'),
        'Raleway-Bold': require('../assets/fonts/Raleway-Bold.ttf'),
    });

    if (!fontsLoaded) {
        return null; // Or a loading indicator
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name="chevron-left" size={20} color="#33363F" />
            </TouchableOpacity>
            <Text style={styles.header}>Profile Setup</Text>

            <ScrollView contentContainerStyle={styles.formContainer}>
                {/* Profile Image Section */}
                <View style={styles.profileImageContainer}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    ) : (
                        <Icon name="user-circle" size={100} color="#ccc" />
                    )}
                </View>

                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                    <Text style={styles.uploadButtonText}>Upload Picture</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                    <Text style={styles.uploadButtonText}>Take Picture</Text>
                </TouchableOpacity>
            </ScrollView>
  
  <View >
    {/* About Me Section */}
  <Text style={styles.sectionHeader}>About Me Section</Text>
                <TextInput
                    style={styles.aboutMeInput}
                    placeholder="Tell Us About Yourself And Your Goals..."
                    multiline
                    numberOfLines={5}
                    value={aboutMe}
                    onChangeText={(text) => setAboutMe(text)}
                />
                </View>
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingVertical: 60,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 1,
    },
    header: {
        fontSize: 25,
        fontFamily: 'Raleway-Bold',
        marginTop: 60,
        marginBottom: 20,
        color: '#000',
    },
    formContainer: {
        width: '100%',
        paddingHorizontal: 20,
    },
    profileImageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    uploadButton: {
        backgroundColor: '#eee',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
    },
    uploadButtonText: {
        fontSize: 16,
        fontFamily: 'Raleway-Medium',
        color: '#000',
    },
    sectionHeader: {
        fontSize: 18,
        fontFamily: 'Raleway-Mdeium',
        marginBottom: 10,
        color: '#000',
      
    },
    aboutMeInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 15,
        paddingVertical: 100,
        fontSize: 16,
        fontFamily: 'Raleway-Regular',
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    continueButton: {
        backgroundColor: '#eee',
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 20,
    },
    continueButtonText: {
        fontSize: 18,
        fontFamily: 'Raleway-Bold',
    },
});