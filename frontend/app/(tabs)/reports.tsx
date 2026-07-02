import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { API_URL } from '@/config/api';

export default function HomeScreen() {

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  //--------------------------------

  useEffect(() => {
    generateReport();
  }, []);

  //--------------------------------

  const generateReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/materials/report`);
      if (!response.ok) throw new Error('Failed to load report data');
      const data = await response.json();
      setReport(data.totalArea ? data : null);
      setLoading(false);
    } catch (err) {
      console.log(err);
      Alert.alert("Error generating report");
      setLoading(false);
    }
  };

  //--------------------------------
  // PDF GENERATOR
  //--------------------------------

  const downloadPDF = async () => {

    if(!report) return;

    const html = `
      <h1>Material Intelligence Report</h1>

      <h3>Total Area Completed:</h3>
      <p>${report.totalArea} sq ft</p>

      <h3>Cement Used:</h3>
      <p>${report.cementUsed} bags</p>

      <h3>Expected Cement:</h3>
      <p>${report.expected.toFixed(2)} bags</p>

      <h3>Extra Cement:</h3>
      <p>${report.extra.toFixed(2)} bags</p>

      <h2 style="color:red;">
        Variance: ${report.variance.toFixed(2)}%
      </h2>

      <h2>Status: ${report.status}</h2>
    `;

    const { uri } = await Print.printToFileAsync({
      html
    });

    await Sharing.shareAsync(uri);
  };

  //--------------------------------

  if(loading){
    return (
      <ActivityIndicator
        style={{flex:1}}
        size="large"
      />
    );
  }

  //--------------------------------

  return (

    <ScrollView style={styles.container}>

      <Text style={styles.header}>
        Admin Intelligence
      </Text>

      {!report ? (

        <View style={styles.card}>
          <Text>No material reports yet.</Text>
        </View>

      ) : (

        <View style={styles.card}>

          <Text style={styles.title}>
            Material Leakage Report
          </Text>

          <Text style={styles.item}>
            Total Area:
            {" "}
            <Text style={styles.bold}>
              {report.totalArea} sq ft
            </Text>
          </Text>

          <Text style={styles.item}>
            Cement Used:
            {" "}
            <Text style={styles.bold}>
              {report.cementUsed} bags
            </Text>
          </Text>

          <Text style={styles.item}>
            Expected Cement:
            {" "}
            <Text style={styles.bold}>
              {report.expected.toFixed(2)} bags
            </Text>
          </Text>

          <Text style={styles.item}>
            Extra Cement:
            {" "}
            <Text style={styles.bold}>
              {report.extra.toFixed(2)} bags
            </Text>
          </Text>

          <Text
            style={{
              marginTop:15,
              fontWeight:'bold',
              color:report.statusColor,
              fontSize:18
            }}
          >
            Variance:
            {" "}
            {report.variance.toFixed(2)}%
          </Text>

          <Text
            style={{
              fontSize:18,
              marginTop:5
            }}
          >
            Status:
            {" "}
            {report.status}
          </Text>

          <TouchableOpacity
            style={styles.btn}
            onPress={downloadPDF}
          >
            <Text style={{color:'#fff'}}>
              Download PDF
            </Text>
          </TouchableOpacity>

        </View>

      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:'#f4f6fb'
  },

  header:{
    fontSize:28,
    fontWeight:'bold',
    padding:20
  },

  card:{
    backgroundColor:'#fff',
    margin:20,
    padding:20,
    borderRadius:18,
    elevation:5
  },

  title:{
    fontSize:20,
    fontWeight:'bold',
    marginBottom:20
  },

  item:{
    fontSize:16,
    marginBottom:8
  },

  bold:{
    fontWeight:'bold'
  },

  btn:{
    backgroundColor:'#2563eb',
    padding:16,
    borderRadius:12,
    marginTop:25,
    alignItems:'center'
  }

});