import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFonts } from 'expo-font';

const { width } = Dimensions.get('window');
const RULER_WIDTH = width * 1;
const ITEM_WIDTH = 40;
const ITEM_HEIGHT = 100;

export default function WeightPicker({ navigation }) {
    const [unit, setUnit] = useState('KG');
    const [weight, setWeight] = useState(75);

    const generateScale = (min, max, step) => {
        const scale = [];
        for (let i = min; i <= max; i += step) {
            scale.push(i.toFixed(1));
        }
        return scale;
    };

    const kgScale = generateScale(35, 130, 0.5);
    const lbScale = generateScale(77, 286, 0.5);
    const currentScale = unit === 'KG' ? kgScale : lbScale;

    const handleScroll = (event) => {
        const offset = event.nativeEvent.contentOffset.x;
        const index = Math.round(offset / ITEM_WIDTH);
        if (currentScale[index]) { // Check if index is within bounds
            setWeight(currentScale[index]);
        }
    };

    const [fontsLoaded] = useFonts({
        'Raleway-Regular': require('../assets/fonts/Raleway-Regular.ttf'),
        'Raleway-Medium': require('../assets/fonts/Raleway-Medium.ttf'),
        'Raleway-Bold': require('../assets/fonts/Raleway-Bold.ttf'),
    });
    const handleContinue = () => {
        if (heightValue) {
            navigation.navigate('Height');
        } else {
            alert("Please select your weight.");
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
            <Text style={styles.header}>What Is Your Weight?</Text>

            <View style={styles.unitToggleContainer}>
                <TouchableOpacity
                    style={[styles.unitButton, unit === 'KG' && styles.unitActive]}
                    onPress={() => setUnit('KG')}
                >
                    <Text style={styles.unitText}>KG</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.unitButton, unit === 'LB' && styles.unitActive]}
                    onPress={() => setUnit('LB')}
                >
                    <Text style={styles.unitText}>LB</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.scaleContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={ITEM_WIDTH}
                    decelerationRate="fast"
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    contentContainerStyle={styles.ruler}
                >
                    {currentScale.map((item, index) => (
                        <View key={index} style={styles.item}>
                            {parseFloat(item) % 1 === 0 ? (
                                <>
                                    <View style={styles.majorTick} />
                                    <Text style={styles.majorText}>{String(item)}</Text>
                                </>
                            ) : (
                                <View style={styles.minorTick} />
                            )}
                        </View>
                    ))}
                </ScrollView>
                <View style={styles.indicator} />
            </View>
            <View style={styles.iconContainer}>
                <Icon name="caret-up" size={50} color="#d6d6d6" />
            </View>
            <Text style={styles.weightText}>{weight} {unit}</Text>

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
    position: 'absolute', // Position it absolutely
    top: 60, // Adjust top as needed (accounting for status bar)
    left: 20, // Adjust left as needed
    zIndex: 1, // Ensure it's above other elements
},
  header: {
    fontSize: 25,
    fontFamily: 'Raleway-Bold',
    marginBottom: 80,
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
    height: ITEM_HEIGHT,
    marginVertical: 20,
    width: RULER_WIDTH,
  },
  ruler: {
    alignItems: 'center',
    paddingHorizontal: RULER_WIDTH / 2 - ITEM_WIDTH / 2,
  },
  item: {
    width: ITEM_WIDTH,
    alignItems: 'center',
  },
  majorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginTop: 5,
  },
  majorTick: {
    width: 2,
    height: 20,
    backgroundColor: '#000',
  },
  minorTick: {
    width: 1,
    height: 10,
    backgroundColor: '#888',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: RULER_WIDTH / 2 - 1,
    height: ITEM_HEIGHT,
    width: 2,
    backgroundColor: '#007AFF',
  },
  weightText: {
    fontSize: 40,
    marginBottom: 20,
    fontWeight: "600",
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
    marginBottom: 20, // Add some spacing below the icons if needed
},
});