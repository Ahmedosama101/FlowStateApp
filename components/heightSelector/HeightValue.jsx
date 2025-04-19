import * as React from "react";
import { View, Text, StyleSheet } from "react-native";

function HeightValue({ value, unit }) {
  return (
    <View style={styles.container}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.unit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    gap: 3,
    marginTop: 55,
  },
  value: {
    fontFamily: "Inter",
    fontSize: 64,
    fontWeight: "700",
    color: "#000",
  },
  unit: {
    fontFamily: "Poppins",
    fontSize: 20,
    color: "#000",
    opacity: 0.65,
    marginTop: 31,
  },
});

export default HeightValue;
