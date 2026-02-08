import { Tabs, router } from 'expo-router'; //
import AsyncStorage from '@react-native-async-storage/async-storage'; //
import { useEffect, useState } from 'react'; //
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { 
  ClipboardCheck, Package, Wallet, BarChart3, 
  MessageSquare, FileText, Mic, Headphones, LogOut, 
  MapPin
} from 'lucide-react-native'; //

export default function TabLayout() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const loadRole = async () => {
      const r = await AsyncStorage.getItem("userRole"); //
      setRole(r); //
    };
    loadRole(); //
  }, []);

  // Simple logout function
  const handleLogout = async () => {
    try {
      // Clear all user session data
      await AsyncStorage.multiRemove(["userId", "userName", "userRole", "currentProject"]);
      // Navigate to login and prevent going back
      router.replace('/login');
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  if (!role) return null; //

  return (
    <Tabs 
      screenOptions={{ 
        headerShown: true, // Set to true to show the logout button in the header
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={18} color="#ef4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        ),
      }}
    >
      {/* WORKER SCREENS */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mark Attendance',
          href: role === "worker" ? undefined : null,
          tabBarIcon: ({size,color}) => <ClipboardCheck size={size} color={color}/>,
        }}
      />

      <Tabs.Screen
        name="voice"
        options={{
          title: 'Voice Update',
          href: role === "worker" ? undefined : null,
          tabBarIcon: ({size,color}) => <Mic size={size} color={color}/>,
        }}
      />


      {/* MANAGER SCREENS */}

      <Tabs.Screen
        name="live-attendance"
        options={{
          title: 'Live Tracking',
          href: role === "manager" ? "/live-attendance" : null,
          tabBarIcon: ({size,color}) => <MapPin size={size} color={color}/>,
        }}
      />

      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          href: role === "manager" ? undefined : null,
          tabBarIcon: ({size,color}) => <ClipboardCheck size={size} color={color}/>,
        }}
      />

      {/* Ensure name matches your local file if you renamed it */}
      <Tabs.Screen
        name="voice-review"
        options={{
          title: 'Voice Updates',
          href: role === "manager" ? undefined : null,
          tabBarIcon: ({size,color}) => <Headphones size={size} color={color}/>,
        }}
      />

      <Tabs.Screen
        name="materials"
        options={{
          title: 'Materials',
          href: role === "manager" ? undefined : null,
          tabBarIcon: ({size,color}) => <Package size={size} color={color}/>,
        }}
      />

      <Tabs.Screen
        name="payroll"
        options={{
          title: 'Payroll',
          href: role === "manager" ? undefined : null,
          tabBarIcon: ({size,color}) => <Wallet size={size} color={color}/>,
        }}
      />

      {/* ADMIN SCREENS */}
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          href: role === "admin" ? undefined : null,
          tabBarIcon: ({size,color}) => <FileText size={size} color={color}/>,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  logoutText: {
    color: '#ef4444',
    marginLeft: 5,
    fontWeight: '600',
    fontSize: 13,
  }
});