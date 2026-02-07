import { View, Text, StyleSheet } from "react-native";

export default function Enquiry() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Worker Enquiry Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:"center",
    alignItems:"center"
  },
  text:{
    fontSize:22,
    fontWeight:"bold"
  }
});
