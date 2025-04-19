import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFonts } from 'expo-font';

const { height } = Dimensions.get('window');
const RULER_HEIGHT = height * 0.45; // Adjust as needed
const ITEM_HEIGHT = 30; // Height of each item in the ruler
const ITEM_WIDTH = 100; // Width of each item in the ruler

export default function HeightPicker({ navigation }) {
    const [unit, setUnit] = useState('CM');
    const [heightValue, setHeightValue] = useState(null); // Start with no height selected

    // Convert CM to FT
    const cmToFt = (cm) => (cm / 30.48).toFixed(1);
    // Convert FT to CM
    const ftToCm = (ft) => (ft * 30.48).toFixed(0);

    // Generate a scale based on min, max, and step values
    const generateScale = (min, max, step) => {
        const scale = [];
        for (let i = min; i <= max; i += step) {
            scale.push(i.toFixed(1));
        }
        return scale;
    };

    const cmScale = generateScale(100, 250, 1); // Centimeters scale (100 cm to 250 cm)
    const ftScale = generateScale(3.0, 8.2, 0.1); // Feet scale (3.0 ft to 8.2 ft)

    const currentScale = unit === 'CM' ? cmScale : ftScale;

    // Handle scroll to update the selected height
    const handleScroll = (event) => {
        const offset = event.nativeEvent.contentOffset.y;
        const index = Math.round(offset / ITEM_HEIGHT); // Calculate the index based on scroll position
        if (currentScale[index]) {
            const newValue = parseFloat(currentScale[index]);
            setHeightValue(newValue); // Update the height value
        }
    };

    // Handle unit change (CM <-> FT)
    const handleUnitChange = (newUnit) => {
        if (newUnit !== unit) {
            if (newUnit === 'CM') {
                setHeightValue(ftToCm(heightValue)); // Convert FT to CM
            } else {
                setHeightValue(cmToFt(heightValue)); // Convert CM to FT
            }
            setUnit(newUnit);
        }
    };

    // Load custom fonts
    const [fontsLoaded] = useFonts({
        'Raleway-Regular': require('../assets/fonts/Raleway-Regular.ttf'),
        'Raleway-Medium': require('../assets/fonts/Raleway-Medium.ttf'),
        'Raleway-Bold': require('../assets/fonts/Raleway-Bold.ttf'),
    });

    // Handle the continue button press
    const handleContinue = () => {
        if (heightValue) {
            navigation.navigate('Belt');
        } else {
            alert("Please select your height.");
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
            <Text style={styles.header}>What Is Your Height?</Text>

            <View style={styles.unitToggleContainer}>
                <TouchableOpacity
                    style={[styles.unitButton, unit === 'CM' && styles.unitActive]}
                    onPress={() => handleUnitChange('CM')}
                >
                    <Text style={styles.unitText}>CM</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.unitButton, unit === 'FT' && styles.unitActive]}
                    onPress={() => handleUnitChange('FT')}
                >
                    <Text style={styles.unitText}>FT</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.scaleContainer}>
                <ScrollView
                    vertical
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT} // Snap to each tick
                    decelerationRate="fast"
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    contentContainerStyle={styles.ruler}
                >
                    {currentScale.map((item, index) => (
                        <View key={index} style={styles.item}>
                            {unit === 'CM' ? (
                                parseFloat(item) % 5 === 0 ? ( // Major ticks every 5 cm
                                    <>
                                        <View style={styles.majorTick} />
                                        <Text style={styles.majorText}>{String(item)}</Text>
                                    </>
                                ) : (
                                    <View style={styles.minorTick} /> // Minor ticks
                                )
                            ) : (
                                parseFloat(item) % 0.5 === 0 ? ( // Major ticks every 0.5 ft
                                    <>
                                        <View style={styles.majorTick} />
                                        <Text style={styles.majorText}>{String(item)}</Text>
                                    </>
                                ) : (
                                    <View style={styles.minorTick} /> // Minor ticks
                                )
                            )}
                        </View>
                    ))}
                </ScrollView>
                <View style={styles.indicator} /> {/* Indicator line */}
            </View>
            <View style={styles.iconContainer}>
                <Icon name="caret-up" size={50} color="#d6d6d6" />
            </View>
            <Text style={styles.heightText}>
                {heightValue ? `${heightValue} ${unit}` : 'Select Height'}
            </Text>

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
        padding: 20,
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
    unitToggleContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#F7F7F7',
        borderRadius: 12,
        overflow: 'hidden',
    },
    unitButton: {
        paddingVertical: 10,
        paddingHorizontal: 50,
    },
    unitActive: {
        backgroundColor: '#BBD4F9',
    },
    unitText: {
        fontSize: 16,
        fontFamily: 'Raleway-Bold',
        fontWeight: '500',
        color: '#000',
    },
    scaleContainer: {
        backgroundColor: '#BBD4F9',
        position: 'relative',
        width: ITEM_WIDTH,
        height: RULER_HEIGHT,
    },
    ruler: {
        alignItems: 'center',
        paddingVertical: RULER_HEIGHT / 2 - ITEM_HEIGHT / 2, // Center the ruler vertically
    },
    item: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    majorText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginLeft: 10,
    },
    majorTick: {
        height: 2,
        width: 20,
        backgroundColor: '#000',
    },
    minorTick: {
        height: 1,
        width: 10,
        backgroundColor: '#888',
    },
    indicator: {
        position: 'absolute',
        top: RULER_HEIGHT / 2 - ITEM_HEIGHT / 2,
        left: 0,
        width: ITEM_WIDTH,
        height: 2,
        backgroundColor: '#007AFF',
    },
    heightText: {
        fontSize: 30,
        fontWeight: "600",
    },
    continueButton: {
        marginTop: 30,
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