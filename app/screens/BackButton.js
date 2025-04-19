import * as React from "react";
import { TouchableOpacity, Image, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

function BackButton() {
  return (
       <TouchableOpacity
         style={styles.backButton}
         onPress={() => navigation.goBack()}
       >
         <Icon name="chevron-left" size={20} color="#33363F" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});

export default BackButton;