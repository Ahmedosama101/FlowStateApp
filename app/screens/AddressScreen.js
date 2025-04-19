import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFonts } from 'expo-font';

export default function AddressScreen({ navigation }) {
    const [address, setAddress] = useState({
        street: '',
        apt: '',
        city: '',
        state: '',
        province: '',
        country: '',
        postalCode: '',
        pinPoint: '',
    });

    const handleContinue = () => {
        // Validate address fields if needed
        navigation.navigate('Profile');
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
            <Text style={styles.header}>What Is Your Address?</Text>

            <ScrollView contentContainerStyle={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Street Address"
                    value={address.street}
                    onChangeText={(text) => setAddress({ ...address, street: text })}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Appt, Suite, Other"
                    value={address.apt}
                    onChangeText={(text) => setAddress({ ...address, apt: text })}
                />
                <TextInput
                    style={styles.input}
                    placeholder="City"
                    value={address.city}
                    onChangeText={(text) => setAddress({ ...address, city: text })}
                />
                <View style={styles.miniContainer}>
                    <TextInput
                        style={[styles.input, styles.miniContainerInput]}
                        placeholder="State"
                        value={address.state}
                        onChangeText={(text) => setAddress({ ...address, state: text })}
                    />
                    <TextInput
                        style={[styles.input, styles.miniContainerInput]}
                        placeholder="Province"
                        value={address.province}
                        onChangeText={(text) => setAddress({ ...address, province: text })}
                    />
                </View>
                <View style={styles.miniContainer}>
                    <TextInput
                        style={[styles.input, styles.miniContainerInput]}
                        placeholder="Country"
                        value={address.country}
                        onChangeText={(text) => setAddress({ ...address, country: text })}
                    />
                    <TextInput
                        style={[styles.input, styles.miniContainerInput]}
                        placeholder="Postal Code"
                        value={address.postalCode}
                        onChangeText={(text) => setAddress({ ...address, postalCode: text })}
                    />
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Pin Point"
                    value={address.pinPoint}
                    onChangeText={(text) => setAddress({ ...address, pinPoint: text })}
                />
            </ScrollView>

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
        marginBottom: 20,
        color: '#000',
    },
    formContainer: {
        width: '100%',
        paddingHorizontal: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 20,
        marginBottom: 15,
        fontSize: 16,
        fontFamily: 'Raleway-Regular',
    },
    miniContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    miniContainerInput: {
        flex: 1,
        marginRight: 10, // Add right margin here
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Raleway-Medium',
        color: '#666',
        marginBottom: 10,
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