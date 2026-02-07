import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function WorkerHome() {
  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>Worker Command Center</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>CHECK IN</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"#ffffff"
  },
  title:{
    fontSize:26,
    fontWeight:"bold",
    marginBottom:40
  },
  button:{
    width:"80%",
    padding:20,
    backgroundColor:"#16a34a",
    borderRadius:14,
    alignItems:"center"
  },
  buttonText:{
    color:"#fff",
    fontSize:18,
    fontWeight:"bold"
  }
});
