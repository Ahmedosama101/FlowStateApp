import * as React from "react";
import { View, StyleSheet } from "react-native";

function HeightMarker() {
  return <View style={styles.marker} />;
}

const styles = StyleSheet.create({
  marker: {
    width: 24,
    height: 2,
    borderWidth: 2,
    borderColor: "#000",
    opacity: 0.8,
    marginBottom: 16,
  },
});

export default HeightMarker;
