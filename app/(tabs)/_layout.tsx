import { Tabs } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ClipboardCheck, Package, Wallet, BarChart3, MessageSquare, FileText } from 'lucide-react-native';

export default function TabLayout() {

  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const loadRole = async () => {
      const r = await AsyncStorage.getItem("userRole");
      setRole(r);
    };
    loadRole();
  }, []);

  if (!role) return null;

  return (
    <Tabs screenOptions={{ headerShown: false }}>

      {/* WORKER */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mark Attendance',
          href: role === "worker" ? undefined : null,
          tabBarIcon: ({size,color}) => (
            <ClipboardCheck size={size} color={color}/>
          ),
        }}
      />

      <Tabs.Screen
        name="enquiry"
        options={{
          title: 'Enquiry',
          href: role === "worker" ? undefined : null,
          tabBarIcon: ({size,color}) => (
            <MessageSquare size={size} color={color}/>
          ),
        }}
      />

      {/* MANAGER */}
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Site Commander',
          href: role === "manager" ? undefined : null,
          tabBarIcon: ({size,color}) => (
            <BarChart3 size={size} color={color}/>
          ),
        }}
      />

      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          href: role === "manager" ? undefined : null,
          tabBarIcon: ({size,color}) => (
            <ClipboardCheck size={size} color={color}/>
          ),
        }}
      />

      <Tabs.Screen
        name="materials"
        options={{
          title: 'Materials',
          href: role === "manager" ? undefined : null,
          tabBarIcon: ({size,color}) => (
            <Package size={size} color={color}/>
          ),
        }}
      />

      <Tabs.Screen
        name="payroll"
        options={{
          title: 'Payroll',
          href: role === "manager" ? undefined : null,
          tabBarIcon: ({size,color}) => (
            <Wallet size={size} color={color}/>
          ),
        }}
      />

      {/* ADMIN ONLY */}
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          href: role === "admin" ? undefined : null,
          tabBarIcon: ({size,color}) => (
            <FileText size={size} color={color}/>
          ),
        }}
      />

    </Tabs>
  );
}
