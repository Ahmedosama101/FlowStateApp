import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Animated, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFonts } from 'expo-font';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 5;

export default function AgeSelector({ navigation }) {
    const ages = Array.from({ length: 70 - 16 + 1 }, (_, i) => 16 + i);
    const scrollX = useRef(new Animated.Value(0)).current;
    const [selectedAge, setSelectedAge] = useState(28);

    const handleScroll = (event) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / ITEM_WIDTH);
        setSelectedAge(ages[index]);
    };

    const handleContinue = () => {
        if (selectedAge) {
            navigation.navigate('WeightScreen');
        } else {
            console.log("Selected Age:", selectedAge); // Use console.log for debugging
            alert("Please select an age."); // User feedback
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

            <Text style={styles.title}>How Old Are You?</Text>

            <View style={styles.selectedAgeContainer}>
                <Text style={styles.selectedAgeText}>{selectedAge}</Text>
            </View>

            <View style={styles.iconContainer}>
                <Icon name="caret-up" size={80} color="#d6d6d6" />
            </View>

            <View style={styles.ageSelectorContainer}>
                <FlatList
                    data={ages}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToAlignment="center"
                    decelerationRate="fast"
                    snapToInterval={ITEM_WIDTH}
                    keyExtractor={(item) => item.toString()}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    onMomentumScrollEnd={handleScroll}
                    contentContainerStyle={styles.flatListContainer}
                    renderItem={({ item, index }) => {
                        const scale = scrollX.interpolate({
                            inputRange: [
                                (index - 2) * ITEM_WIDTH,
                                (index - 1) * ITEM_WIDTH,
                                index * ITEM_WIDTH,
                                (index + 1) * ITEM_WIDTH,
                                (index + 2) * ITEM_WIDTH,
                            ],
                            outputRange: [0.6, 0.8, 1, 0.8, 0.6],
                            extrapolate: 'clamp',
                        });

                        const opacity = scrollX.interpolate({
                            inputRange: [
                                (index - 2) * ITEM_WIDTH,
                                (index - 1) * ITEM_WIDTH,
                                index * ITEM_WIDTH,
                                (index + 1) * ITEM_WIDTH,
                                (index + 2) * ITEM_WIDTH,
                            ],
                            outputRange: [0.3, 0.5, 1, 0.5, 0.3],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View style={[styles.itemContainer, { transform: [{ scale }], opacity }]}>
                                <Text style={[styles.itemText, selectedAge === item && styles.selectedItem]}>
                                    {String(item)} {/* Explicit string conversion here */}
                                </Text>
                            </Animated.View>
                        );
                    }}
                />
            </View>

            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
}

// ... styles (no changes needed)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingTop: 30,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 1,
    },
    title: {
        fontSize: 25,
        fontFamily: 'Raleway-Bold',
        marginBottom: 80,
        color: '#000',
    },
    ageSelectorContainer: {
        position: 'relative',
        width: '100%',
        height: 150,
        backgroundColor: '#d0e6ff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    flatListContainer: {
        paddingHorizontal: width / 2 - ITEM_WIDTH / 2,
    },
    itemContainer: {
        width: ITEM_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 40,
        color: '#6e6e6e',
    },
    selectedItem: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#000',
    },
    selectedAgeContainer: {
        alignItems: 'center',
    },
    selectedAgeText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#000',
    },
    continueButton: {
        marginTop: 90,
        backgroundColor: '#eee',
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 25,
    },
    continueButtonText: {
        fontSize: 18,
        fontFamily: 'Raleway-Bold',
    },
    iconContainer: {
        marginBottom: 20,
    },
});