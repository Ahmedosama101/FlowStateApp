import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFonts } from 'expo-font';

export default function BeltPicker({ navigation }) {
    const [selectedBelt, setSelectedBelt] = useState(null);

    const belts = [
        { id: 1, name: 'White', icon: require('../assets/white.png') },
        { id: 2, name: 'Blue', icon: require('../assets/blue.png') },
        { id: 3, name: 'Purple', icon: require('../assets/purple.png') },
        { id: 4, name: 'Brown', icon: require('../assets/brown.png') },
        { id: 5, name: 'Black', icon: require('../assets/black.png') },
    ];

    const handleBeltSelection = (belt) => {
        setSelectedBelt(belt);
    };

    const [fontsLoaded] = useFonts({
        'Raleway-Regular': require('../assets/fonts/Raleway-Regular.ttf'),
        'Raleway-Medium': require('../assets/fonts/Raleway-Medium.ttf'),
        'Raleway-Bold': require('../assets/fonts/Raleway-Bold.ttf'),
    });

    const handleContinue = () => {
        if (selectedBelt) {
            navigation.navigate('Address');
        } else {
            alert("Please select a belt.");
        }
    };

    if (!fontsLoaded) {
        return null; // Or a loading indicator
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name="chevron-left" size={20} color="#33363F" />
            </TouchableOpacity>
            <Text style={styles.header}>What Is Your Belt?</Text>

            <ScrollView contentContainerStyle={styles.beltContainer}>
                {belts.map((belt) => (
                    <TouchableOpacity
                        key={belt.id}
                        style={[
                            styles.beltButton,
                            selectedBelt?.id === belt.id && styles.selectedBelt,
                        ]}
                        onPress={() => handleBeltSelection(belt)}
                    >
                        <Image source={belt.icon} style={styles.beltIcon} />
                        <Text style={styles.beltText}>{belt.name}</Text>
                    </TouchableOpacity>
                ))}
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
    beltContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    beltButton: {
        width: 130,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
        borderRadius: 10,
        backgroundColor: '#ddd', // Default gray color
    },
    selectedBelt: {
        backgroundColor: '#89CFF0', // Baby blue color when selected
    },
    beltIcon: {
        width:  120,
        height: 50,
        marginBottom: 10,
    },
    beltText: {
        fontSize: 16,
        fontFamily: 'Raleway-Bold',
        color: '#000',
    },
    continueButton: {
        backgroundColor: '#eee',
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 25,
    },
    continueButtonText: {
        fontSize: 18,
        fontFamily: 'Raleway-Bold',
    },
});