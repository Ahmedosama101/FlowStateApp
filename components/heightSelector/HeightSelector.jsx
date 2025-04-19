import * as React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import BackButton from "./BackButton";
import HeightMarker from "./HeightMarker";
import HeightValue from "./HeightValue";

const heightValues = [175, 170, 165, 160, 155];
const markerCount = 19;

function HeightSelector() {
  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>What Is Your Height?</Text>
      <HeightValue value="165" unit="cm" />
      <View style={styles.heightSelectorContainer}>
        <View style={styles.heightValuesContainer}>
          {heightValues.map((value, index) => (
            <Text key={index} style={styles.heightValueText}>
              {value}
            </Text>
          ))}
        </View>
        <View style={styles.markersContainer}>
          {[...Array(markerCount)].map((_, index) => (
            <HeightMarker key={index} />
          ))}
        </View>
      </View>
      <TouchableOpacity style={styles.continueButton}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: 480,
    borderRadius: 20,
    padding: 34,
    overflow: "hidden",
  },
  title: {
    color: "#000",
    fontFamily: "Inter",
    fontSize: 25,
    fontWeight: "700",
    textTransform: "capitalize",
    marginTop: 81,
    alignSelf: "flex-end",
  },
  heightSelectorContainer: {
    display: "flex",
    gap: 5,
    marginTop: 31,
    width: 184,
  },
  heightValuesContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: 14,
  },
  heightValueText: {
    fontFamily: "Inter",
    fontSize: 25,
    color: "#000",
    fontWeight: "700",
    opacity: 0.45,
    marginBottom: 56,
  },
  markersContainer: {
    borderRadius: 10,
    padding: 27,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  continueButton: {
    marginTop: 82,
  },
  continueButtonText: {
    color: "#000",
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "500",
    textTransform: "capitalize",
  },
});

export default HeightSelector;
