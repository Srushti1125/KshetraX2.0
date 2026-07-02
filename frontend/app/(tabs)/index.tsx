import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as Application from 'expo-application';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getDistance } from 'geolib';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from '@/config/api';
import { AttendanceTracker } from '@/services/attendanceTracker';

export default function Index() {
  const [site, setSite] = useState<any>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [inside, setInside] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [trustScore, setTrustScore] = useState<number | null>(null);

  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    initWorker();
    fetchSite();
    checkActiveSession();
  }, []);

  // INIT WORKER (Trust Score + Device Binding)
  const initWorker = async () => {
    const uid = await AsyncStorage.getItem('userId');
    if (!uid) return;

    try {
      const response = await fetch(`${API_URL}/api/users/${uid}`);
      if (!response.ok) {
        throw new Error('User not found');
      }
      const data = await response.json();
      const deviceId = Application.getAndroidId();

      // DEVICE BINDING CHECK
      if (!data.deviceId) {
        const updateRes = await fetch(`${API_URL}/api/users/${uid}/device-bind`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId }),
        });
        const updatedUser = await updateRes.json();
        setTrustScore(updatedUser.trustScore ?? 100);
      } else if (data.deviceId !== deviceId) {
        Alert.alert("Unauthorized Device", "Use your registered phone.");
        return;
      } else {
        setTrustScore(data.trustScore ?? 100);
      }
    } catch (err) {
      console.log('Error initializing worker:', err);
    }
  };

  // CHECK IF USER HAS ACTIVE SESSION
  const checkActiveSession = async () => {
    const activeSessionId = await AsyncStorage.getItem('activeSessionId');
    const savedCheckInTime = await AsyncStorage.getItem('checkInTime');
    if (activeSessionId && savedCheckInTime) {
      setIsCheckedIn(true);
      setSessionId(activeSessionId);
      setCheckInTime(new Date(parseInt(savedCheckInTime)));
    }
  };

  // FETCH SITE
  const fetchSite = async () => {
    try {
      const response = await fetch(`${API_URL}/api/sites/site_1`);
      if (response.ok) {
        const data = await response.json();
        setSite(data);
      } else {
        Alert.alert("Site not found in database");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error fetching site");
    }
  };

  // VERIFY LOCATION
  const checkLocation = async () => {
    if (!site) return;

    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      Alert.alert("Turn ON location services");
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Location permission required");
      return;
    }

    setLoading(true);

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const dist = getDistance(
        { latitude: location.coords.latitude, longitude: location.coords.longitude },
        { latitude: site.latitude, longitude: site.longitude }
      );

      setDistance(dist);

      if (dist <= site.radius - 15) {
        setInside(true);
      } else {
        setInside(false);
        Alert.alert(`Outside site by ${Math.floor(dist - site.radius)} meters`);
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Failed to fetch location");
    }

    setLoading(false);
  };

  // TAKE SELFIE
  const takePhoto = async () => {
    if (!inside) {
      Alert.alert("Verify location first");
      return;
    }

    if (!cameraRef.current) {
      Alert.alert("Camera not ready");
      return;
    }

    try {
      const pic = await cameraRef.current.takePictureAsync({
        quality: 0.5,
      });

      setPhoto(pic.uri);
    } catch (err) {
      console.log(err);
      Alert.alert("Failed to take photo");
    }
  };

  // CHECK IN
  const checkIn = async () => {
    if (!inside || !photo) {
      Alert.alert("Complete validations first", "Verify location and take selfie");
      return;
    }

    setLoading(true);

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const dist = getDistance(
        { latitude: location.coords.latitude, longitude: location.coords.longitude },
        { latitude: site.latitude, longitude: site.longitude }
      );

      if (dist > site.radius - 15) {
        setInside(false);
        Alert.alert("Location changed. You are outside now.");
        setLoading(false);
        return;
      }

      const userId = await AsyncStorage.getItem('userId') || '1';
      const userName = await AsyncStorage.getItem('userName') || 'Unknown';
      const timestamp = Date.now();
      const deviceId = Application.getAndroidId();
      
      const newSessionId = `session_${userId}_${timestamp}`;

      // Upload selfie image & check-in details via multipart/form-data
      const formData = new FormData();
      formData.append('sessionId', newSessionId);
      formData.append('userId', userId);
      formData.append('userName', userName);
      formData.append('deviceId', deviceId);
      formData.append('siteId', 'site_1');
      formData.append('checkInTime', timestamp.toString());
      formData.append('latitude', location.coords.latitude.toString());
      formData.append('longitude', location.coords.longitude.toString());
      formData.append('distanceFromSite', dist.toString());
      formData.append('trustScore', (trustScore ?? 100).toString());
      
      formData.append('selfie', {
        uri: photo,
        name: `selfie_${userId}_${timestamp}.jpg`,
        type: 'image/jpeg'
      } as any);

      const checkInRes = await fetch(`${API_URL}/api/attendance/check-in`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const checkInData = await checkInRes.json();
      if (!checkInRes.ok) {
        throw new Error(checkInData.error || 'Server rejected check-in');
      }

      await AsyncStorage.setItem('activeSessionId', newSessionId);
      await AsyncStorage.setItem('checkInTime', timestamp.toString());

      await AttendanceTracker.startTracking(userId, newSessionId);

      setIsCheckedIn(true);
      setSessionId(newSessionId);
      setCheckInTime(new Date(timestamp));
      
      Alert.alert("✅ Checked In Successfully!", "Your location is being tracked");
      
      // Reset state
      setInside(false);
      setDistance(null);
      setPhoto(null);

    } catch (err: any) {
      console.log(err);
      Alert.alert("Failed to check in", err.message || '');
    }

    setLoading(false);
  };

  // CHECK OUT
  const checkOut = async () => {
    if (!sessionId) return;

    Alert.alert(
      "Check Out",
      "Are you sure you want to check out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Check Out",
          onPress: async () => {
            setLoading(true);
            try {
              const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.BestForNavigation,
              });

              const checkOutTime = Date.now();
              const totalHours = AttendanceTracker.calculateHours(
                checkInTime!.getTime(),
                checkOutTime
              );

              const checkOutRes = await fetch(`${API_URL}/api/attendance/check-out`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId,
                  checkOutTime,
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  totalHours
                }),
              });

              if (!checkOutRes.ok) {
                throw new Error('Server rejected check-out');
              }

              await AttendanceTracker.stopTracking();

              await AsyncStorage.removeItem('activeSessionId');
              await AsyncStorage.removeItem('checkInTime');

              Alert.alert("✅ Checked Out Successfully!", `Total hours: ${totalHours}h`);

              setIsCheckedIn(false);
              setSessionId(null);
              setCheckInTime(null);
            } catch (err) {
              console.log(err);
              Alert.alert("Failed to check out");
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  // Loading states
  if (!site || !permission) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>Camera permission required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate compliance level
  const compliance =
    trustScore === null
      ? ""
      : trustScore >= 85
      ? "HIGH ✅"
      : trustScore >= 70
      ? "MEDIUM ⚠️"
      : "LOW 🚨";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isCheckedIn ? 'Active Session' : 'Mark Attendance'}
      </Text>

      {/* Trust Score Card */}
      {trustScore !== null && (
        <View style={styles.trustCard}>
          <Text style={styles.trustText}>Trust Score: {trustScore}</Text>
          <Text style={styles.complianceText}>Compliance: {compliance}</Text>
        </View>
      )}

      {/* Active Session Info */}
      {isCheckedIn && checkInTime && (
        <View style={styles.activeSession}>
          <Text style={styles.sessionText}>
            Checked in at: {checkInTime.toLocaleTimeString()}
          </Text>
          <Text style={styles.sessionSubtext}>
            Your location is being tracked every 5 minutes
          </Text>
        </View>
      )}

      {/* Check In Flow */}
      {!isCheckedIn && (
        <>
          <TouchableOpacity style={styles.button} onPress={checkLocation}>
            <Text style={styles.buttonText}>Verify Location</Text>
          </TouchableOpacity>

          {distance !== null && (
            <Text style={styles.status}>Distance: {distance}m</Text>
          )}

          {/* Camera View or Photo Preview */}
          {!photo ? (
            <CameraView ref={cameraRef} style={styles.camera} facing="front" />
          ) : (
            <Image source={{ uri: photo }} style={styles.camera} />
          )}

          {/* Take Selfie Button */}
          {inside && !photo && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✅ Inside Site Range</Text>
              <TouchableOpacity 
                style={[styles.button, {backgroundColor: '#10b981'}]} 
                onPress={takePhoto}
              >
                <Text style={styles.buttonText}>Take Selfie</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Check In Button */}
          {photo && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✅ Ready to Check In</Text>
              <TouchableOpacity 
                style={[styles.button, {backgroundColor: '#10b981'}]} 
                onPress={checkIn}
              >
                <Text style={styles.buttonText}>Check In Now</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, {backgroundColor: '#6b7280'}]} 
                onPress={() => setPhoto(null)}
              >
                <Text style={styles.buttonText}>Retake Photo</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {!inside && distance !== null && (
            <Text style={{color:'red', fontSize: 16, marginVertical: 10, textAlign:'center'}}>
              ❌ Outside Site
            </Text>
          )}
        </>
      )}

      {/* Check Out Button */}
      {isCheckedIn && (
        <TouchableOpacity style={[styles.button, styles.checkOutButton]} onPress={checkOut}>
          <Text style={styles.buttonText}>Check Out</Text>
        </TouchableOpacity>
      )}

      {loading && <ActivityIndicator style={{marginTop:20}} size="large" color="#2563eb" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'center', 
    backgroundColor: '#fff' 
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  trustCard: {
    backgroundColor: '#eef2ff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  trustText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1e1b4b',
    marginBottom: 4,
  },
  complianceText: {
    fontSize: 14,
    color: '#4338ca',
  },
  activeSession: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  sessionText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1e40af', 
    marginBottom: 4 
  },
  sessionSubtext: { 
    fontSize: 13, 
    color: '#60a5fa' 
  },
  button: { 
    backgroundColor: '#2563eb', 
    padding: 14, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginVertical: 10 
  },
  checkOutButton: { 
    backgroundColor: '#ef4444' 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  status: { 
    textAlign: 'center', 
    fontSize: 16, 
    marginTop: 10, 
    fontWeight: '600' 
  },
  camera: {
    width: '100%',
    height: 320,
    borderRadius: 12,
    marginVertical: 15,
  },
  successBox: { 
    marginTop: 10, 
    alignItems: 'center' 
  },
  successText: { 
    color: 'green', 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
});



// import { useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
// import * as Location from 'expo-location';
// import { getDistance } from 'geolib';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// import { db, auth } from '../../config/firebase';
// import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
// import { AttendanceTracker } from '../services/attendanceTracker';

// export default function Index() {
//   const [site, setSite] = useState<any>(null);
//   const [distance, setDistance] = useState<number | null>(null);
//   const [inside, setInside] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [isCheckedIn, setIsCheckedIn] = useState(false);
//   const [sessionId, setSessionId] = useState<string | null>(null);
//   const [checkInTime, setCheckInTime] = useState<Date | null>(null);

//   useEffect(() => {
//     fetchSite();
//     checkActiveSession();
//   }, []);

//   // Check if user has active session
//   const checkActiveSession = async () => {
//     const activeSessionId = await AsyncStorage.getItem('activeSessionId');
//     if (activeSessionId) {
//       setIsCheckedIn(true);
//       setSessionId(activeSessionId);
      
//       const sessionRef = doc(db, 'attendanceSessions', activeSessionId);
//       const sessionSnap = await getDoc(sessionRef);
      
//       if (sessionSnap.exists()) {
//         const data = sessionSnap.data();
//         setCheckInTime(new Date(data.checkInTime));
//       }
//     }
//   };

//   // FETCH SITE
//   const fetchSite = async () => {
//     try {
//       const refDoc = doc(db, 'sites', 'site_1');
//       const snap = await getDoc(refDoc);

//       if (snap.exists()) {
//         setSite(snap.data());
//       } else {
//         Alert.alert("Site not found in Firestore");
//       }
//     } catch (err) {
//       console.log(err);
//       Alert.alert("Error fetching site");
//     }
//   };

//   // VERIFY LOCATION
//   const checkLocation = async () => {
//     if (!site) return;

//     const enabled = await Location.hasServicesEnabledAsync();
//     if (!enabled) {
//       Alert.alert("Turn ON location services");
//       return;
//     }

//     const { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert("Location permission required");
//       return;
//     }

//     setLoading(true);

//     try {
//       const location = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.BestForNavigation,
//       });

//       const dist = getDistance(
//         { latitude: location.coords.latitude, longitude: location.coords.longitude },
//         { latitude: site.latitude, longitude: site.longitude }
//       );

//       setDistance(dist);

//       if (dist <= site.radius - 15) {
//         setInside(true);
//       } else {
//         setInside(false);
//         Alert.alert(`Outside site by ${Math.floor(dist - site.radius)} meters`);
//       }
//     } catch (err) {
//       console.log(err);
//       Alert.alert("Failed to fetch location");
//     }

//     setLoading(false);
//   };

//   // CHECK IN (Camera logic removed)
//   const checkIn = async () => {
//     if (!inside) {
//       Alert.alert("You are outside the site!");
//       return;
//     }

//     setLoading(true);

//     try {
//       const location = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.BestForNavigation,
//       });

//       const dist = getDistance(
//         { latitude: location.coords.latitude, longitude: location.coords.longitude },
//         { latitude: site.latitude, longitude: site.longitude }
//       );

//       if (dist > site.radius - 15) {
//         setInside(false);
//         Alert.alert("Location changed. You are outside now.");
//         setLoading(false);
//         return;
//       }

//       const userId = auth.currentUser?.uid || 'unknown';
//       const timestamp = Date.now();
      
//       const newSessionId = `session_${userId}_${timestamp}`;
//       const sessionRef = doc(db, 'attendanceSessions', newSessionId);

//       await setDoc(sessionRef, {
//         userId,
//         userName: await AsyncStorage.getItem('userName') || 'Unknown',
//         siteId: 'site_1',
//         checkInTime: timestamp,
//         checkInLocation: {
//           latitude: location.coords.latitude,
//           longitude: location.coords.longitude,
//         },
//         distanceFromSite: dist,
//         status: 'active',
//         locationPings: [{
//           latitude: location.coords.latitude,
//           longitude: location.coords.longitude,
//           accuracy: location.coords.accuracy,
//           timestamp,
//         }],
//         createdAt: serverTimestamp(),
//       });

//       await AttendanceTracker.startTracking(userId, newSessionId);

//       setIsCheckedIn(true);
//       setSessionId(newSessionId);
//       setCheckInTime(new Date(timestamp));
      
//       Alert.alert("✅ Checked In Successfully!", "Your location is being tracked");
//       setInside(false);
//       setDistance(null);

//     } catch (err) {
//       console.log(err);
//       Alert.alert("Failed to check in");
//     }

//     setLoading(false);
//   };

//   // CHECK OUT
//   const checkOut = async () => {
//     if (!sessionId) return;

//     Alert.alert(
//       "Check Out",
//       "Are you sure you want to check out?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Check Out",
//           onPress: async () => {
//             setLoading(true);
//             try {
//               const location = await Location.getCurrentPositionAsync({
//                 accuracy: Location.Accuracy.BestForNavigation,
//               });

//               const checkOutTime = Date.now();
//               const totalHours = AttendanceTracker.calculateHours(
//                 checkInTime!.getTime(),
//                 checkOutTime
//               );

//               const sessionRef = doc(db, 'attendanceSessions', sessionId);
              
//               await updateDoc(sessionRef, {
//                 checkOutTime,
//                 checkOutLocation: {
//                   latitude: location.coords.latitude,
//                   longitude: location.coords.longitude,
//                 },
//                 totalHours,
//                 status: 'completed',
//                 completedAt: serverTimestamp(),
//               });

//               await AttendanceTracker.stopTracking();

//               Alert.alert("✅ Checked Out Successfully!", `Total hours: ${totalHours}h`);

//               setIsCheckedIn(false);
//               setSessionId(null);
//               setCheckInTime(null);
//             } catch (err) {
//               console.log(err);
//               Alert.alert("Failed to check out");
//             }
//             setLoading(false);
//           }
//         }
//       ]
//     );
//   };

//   if (!site) return <ActivityIndicator style={{ flex: 1 }} />;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>
//         {isCheckedIn ? 'Active Session' : 'Mark Attendance'}
//       </Text>

//       {isCheckedIn && checkInTime && (
//         <View style={styles.activeSession}>
//           <Text style={styles.sessionText}>
//             Checked in at: {checkInTime.toLocaleTimeString()}
//           </Text>
//           <Text style={styles.sessionSubtext}>
//             Your location is being tracked every 5 minutes
//           </Text>
//         </View>
//       )}

//       {!isCheckedIn && (
//         <>
//           <TouchableOpacity style={styles.button} onPress={checkLocation}>
//             <Text style={styles.buttonText}>Verify Location</Text>
//           </TouchableOpacity>

//           {distance !== null && (
//             <Text style={styles.status}>Distance: {distance}m</Text>
//           )}

//           {inside && (
//             <View style={styles.successBox}>
//                <Text style={styles.successText}>✅ Inside Site Range</Text>
//                <TouchableOpacity style={[styles.button, {backgroundColor: '#10b981'}]} onPress={checkIn}>
//                 <Text style={styles.buttonText}>Check In Now</Text>
//               </TouchableOpacity>
//             </View>
//           )}
          
//           {!inside && distance !== null && (
//             <Text style={{color:'red', fontSize: 16, marginVertical: 10, textAlign:'center'}}>
//               ❌ Outside Site
//             </Text>
//           )}
//         </>
//       )}

//       {isCheckedIn && (
//         <TouchableOpacity style={[styles.button, styles.checkOutButton]} onPress={checkOut}>
//           <Text style={styles.buttonText}>Check Out</Text>
//         </TouchableOpacity>
//       )}

//       {loading && <ActivityIndicator style={{marginTop:20}} size="large" color="#2563eb" />}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
//   title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
//   activeSession: {
//     backgroundColor: '#eff6ff',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 20,
//     borderLeftWidth: 4,
//     borderLeftColor: '#2563eb',
//   },
//   sessionText: { fontSize: 16, fontWeight: '600', color: '#1e40af', marginBottom: 4 },
//   sessionSubtext: { fontSize: 13, color: '#60a5fa' },
//   button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 10, alignItems: 'center', marginVertical: 10 },
//   checkOutButton: { backgroundColor: '#ef4444' },
//   buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
//   status: { textAlign: 'center', fontSize: 16, marginTop: 10, fontWeight: '600' },
//   successBox: { marginTop: 10, alignItems: 'center' },
//   successText: { color: 'green', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }
// });


