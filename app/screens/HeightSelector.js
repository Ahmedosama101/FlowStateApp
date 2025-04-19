import * as React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

// ContinueButton Component
function ContinueButton({ title }) {
  return (
    <TouchableOpacity style={styles.buttonContainer}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

// BackButton Component
function BackButton({ navigation }) {
  return (
    <TouchableOpacity
      style={styles.backButton}
      onPress={() => navigation.goBack()}
    >
      <Icon name="chevron-left" size={20} color="#33363F" />
    </TouchableOpacity>
  );
}

// HeightDisplay Component
function HeightDisplay({ height, units }) {
  return (
    <View style={styles.displayContainer}>
      <Text style={styles.heightText}>{height}</Text>
      <Text style={styles.unitText}>{units}</Text>
    </View>
  );
}

// HeightSelector Component
function HeightSelector({ values }) {
  return (
    <View style={styles.scaleContainer}>
      <HeightOptions values={values} />
      <VerticalGuide />
    </View>
  );
}

// HeightOptions Component (used inside HeightSelector)
function HeightOptions({ values }) {
  return (
    <ScrollView contentContainerStyle={styles.optionsContainer}>
      {values.map((value, index) => (
        <Text key={index} style={styles.optionText}>{value}</Text>
      ))}
    </ScrollView>
  );
}

// VerticalGuide Component (used inside HeightSelector)
function VerticalGuide() {
  return (
    <View style={styles.guideContainer}>
      {Array.from({ length: 18 }).map((_, index) => (
        <View key={index} style={styles.guideLine} />
      ))}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  // ContinueButton Styles
  buttonContainer: {
    marginTop: 82,
  },
  buttonText: {
    color: "#000",
    fontFamily: "'Inter',sans-serif",
    fontSize: 18,
    fontWeight: "500",
    textTransform: "capitalize",
  },

  // BackButton Styles
  backButton: {
    alignSelf: "flex-start",
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    width: 24,
    height: 24,
  },

  // HeightDisplay Styles
  displayContainer: {
    display: "flex",
    alignItems: "center",
    gap: 3,
    marginTop: 55,
    fontFamily: "'Inter',sans-serif",
    color: "#000",
    width: "100%",
  },
  heightText: {
    fontSize: 64,
    fontWeight: "700",
  },
  unitText: {
    fontFamily: "'Poppins',sans-serif",
    fontSize: 20,
    opacity: 0.65,
    marginTop: 31,
  },

  // HeightSelector Styles
  scaleContainer: {
    display: "flex",
    gap: 5,
    marginTop: 31,
    width: 184,
  },
  optionsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: 14,
    fontFamily: "'Inter',sans-serif",
    color: "#000",
    fontWeight: "700",
  },
  optionText: {
    fontSize: 25,
    opacity: 0.45,
    marginBottom: 56,
  },
  guideContainer: {
    borderRadius: 10,
    paddingTop: 27,
    paddingRight: 18,
    paddingBottom: 47,
    paddingLeft: 18,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  guideLine: {
    width: 24,
    height: 2,
    borderWidth: 2,
    borderColor: "#000",
    opacity: 0.8,
    marginBottom: 16,
  },
});

export { ContinueButton, BackButton, HeightDisplay, HeightSelector };