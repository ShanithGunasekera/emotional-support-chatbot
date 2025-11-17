import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setResponseType } from '../../src/store/chatSlice';

const RESPONSE_TYPES = [
  {
    id: 'empathetic',
    label: '💝 Empathetic',
    description: 'Understanding and compassionate responses',
    color: '#FF6B6B',
  },
  {
    id: 'motivational',
    label: '🚀 Motivational',
    description: 'Encouraging and uplifting support',
    color: '#4ECDC4',
  },
  {
    id: 'stress_relief',
    label: '🌊 Stress Relief',
    description: 'Calming and grounding techniques',
    color: '#45B7D1',
  },
  {
    id: 'friendly',
    label: '😊 Friendly Chat',
    description: 'Casual and warm conversation',
    color: '#96CEB4',
  },
  {
    id: 'encouragement',
    label: '🌈 Encouragement',
    description: 'Positive reinforcement and support',
    color: '#FFEAA7',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleResponseTypeSelect = (typeId: string) => {
    dispatch(setResponseType(typeId));
    router.push('/chat');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Your Emotional Support Companion</Text>
          <Text style={styles.welcomeSubtitle}>
            I'm here to listen, support, and help you through whatever you're feeling.
          </Text>
        </View>

        <View style={styles.selectionSection}>
          <Text style={styles.sectionTitle}>How would you like me to support you today?</Text>
          
          {RESPONSE_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[styles.typeCard, { borderLeftColor: type.color }]}
              onPress={() => handleResponseTypeSelect(type.id)}
            >
              <Text style={styles.typeEmoji}>{type.label.split(' ')[0]}</Text>
              <View style={styles.typeTextContainer}>
                <Text style={styles.typeLabel}>
                  {type.label.split(' ').slice(1).join(' ')}
                </Text>
                <Text style={styles.typeDescription}>{type.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About This Companion</Text>
          <Text style={styles.infoText}>
            • 100% ethical and safe conversations{'\n'}
            • No medical or legal advice{'\n'}
            • Privacy-focused{'\n'}
            • Always here to listen
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
  },
  welcomeSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  selectionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  typeCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  typeEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  typeTextContainer: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  infoSection: {
    backgroundColor: '#EFF6FF',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
});