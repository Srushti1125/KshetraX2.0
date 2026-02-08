import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';

import { db, auth } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function MaterialsScreen() {

  const [material, setMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [area, setArea] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  //-----------------------------------

  const submitLog = async () => {

    if (!material || !quantity || !area) {
      Alert.alert('Please fill all required fields');
      return;
    }

    try {

      setLoading(true);

      const docRef = await addDoc(
        collection(db, 'materialLogs'),
        {
          material: material.toLowerCase().trim(),
          quantityUsed: Number(quantity),
          unit: unit || 'bags',
          areaCompleted: Number(area),
          notes: notes || '',
          createdBy: auth.currentUser?.uid || null,
          createdAt: serverTimestamp(),
        }
      );

      console.log('Saved ID:', docRef.id);
      Alert.alert('Saved successfully!');

      // Reset form
      setMaterial('');
      setQuantity('');
      setUnit('');
      setArea('');
      setNotes('');

      setLoading(false);

    } catch (err) {
      console.log('FIREBASE ERROR:', err);
      Alert.alert('Error saving');
      setLoading(false);
    }
  };

  //-----------------------------------

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>Daily Material Entry</Text>

      <Text style={styles.subtitle}>
        Enter today’s material usage. Admin will audit consumption.
      </Text>

      {/* MATERIAL */}
      <Text style={styles.label}>Material *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Cement"
        value={material}
        onChangeText={setMaterial}
      />

      {/* QUANTITY */}
      <Text style={styles.label}>Quantity Used *</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="e.g. 120"
        value={quantity}
        onChangeText={setQuantity}
      />

      {/* UNIT */}
      <Text style={styles.label}>Unit</Text>
      <TextInput
        style={styles.input}
        placeholder="bags / tons / kg"
        value={unit}
        onChangeText={setUnit}
      />

      {/* AREA */}
      <Text style={styles.label}>Area Completed Today (sqft) *</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="e.g. 450"
        value={area}
        onChangeText={setArea}
      />

      {/* NOTES */}
      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={[styles.input, { height: 90 }]}
        multiline
        placeholder="Anything unusual?"
        value={notes}
        onChangeText={setNotes}
      />

      {/* BUTTON */}
      <TouchableOpacity
        style={styles.button}
        onPress={submitLog}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            Submit Daily Log
          </Text>
        )}
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    padding:20,
    backgroundColor:'#f9fafb'
  },

  title:{
    fontSize:26,
    fontWeight:'bold',
    marginBottom:6
  },

  subtitle:{
    color:'#6b7280',
    marginBottom:20
  },

  label:{
    fontWeight:'600',
    marginBottom:6,
    marginTop:10
  },

  input:{
    backgroundColor:'#fff',
    padding:14,
    borderRadius:10,
    borderWidth:1,
    borderColor:'#e5e7eb'
  },

  button:{
    backgroundColor:'#2563eb',
    padding:16,
    borderRadius:12,
    marginTop:25,
    alignItems:'center'
  },

  buttonText:{
    color:'#fff',
    fontWeight:'bold',
    fontSize:16
  }
});
