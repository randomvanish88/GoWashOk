import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
      <Ionicons name="car" size={80} color="#10b981" style={{ marginBottom: 20 }} />
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 }}>
        GoWash POS
      </Text>
      <ActivityIndicator size="large" color="#10b981" />
    </View>
  );
}
