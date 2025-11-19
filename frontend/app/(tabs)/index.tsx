import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { setResponseType } from '../../src/store/chatSlice';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

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

const DAILY_GAMES = [
  {
    id: 1,
    name: "Gratitude Journal",
    emoji: "📝",
    description: "Write three things you're grateful for",
    color: "#A78BFA"
  },
  {
    id: 2,
    name: "Breathing Exercise", 
    emoji: "🌬️",
    description: "Calm your mind with guided breathing",
    color: "#60A5FA"
  },
  {
    id: 3,
    name: "Positive Affirmations",
    emoji: "💫",
    description: "Boost your confidence with positive statements",
    color: "#34D399"
  },
  {
    id: 4,
    name: "Mindful Observation",
    emoji: "👀",
    description: "Practice mindfulness through observation",
    color: "#FBBF24"
  }
];

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { user } = useAuth();
  const botAvatar = useSelector((state: any) => state.chat.botAvatar);

  const handleResponseTypeSelect = (typeId: string) => {
    dispatch(setResponseType(typeId));
    router.push('/chat');
  };

  const handleGameSelect = (game: any) => {
    // In a real app, this would navigate to the game
    alert(`Starting ${game.name} - ${game.description}`);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    welcomeSection: {
      backgroundColor: colors.card,
      padding: 24,
      borderRadius: 16,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    welcomeTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    welcomeSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: 16,
    },
    avatar: {
      fontSize: 48,
      marginBottom: 8,
    },
    selectionSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    typeCard: {
      backgroundColor: colors.card,
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
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.text,
      marginBottom: 4,
    },
    typeDescription: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    gamesSection: {
      marginBottom: 24,
    },
    gameCard: {
      backgroundColor: colors.card,
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
      borderWidth: 1,
      borderColor: colors.border,
    },
    gameEmoji: {
      fontSize: 24,
      marginRight: 12,
    },
    gameTextContainer: {
      flex: 1,
    },
    gameName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    gameDescription: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    infoSection: {
      backgroundColor: colors.primary + '20',
      padding: 20,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    iconButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Mindful Companion</Text>
          <TouchableOpacity 
            style={styles.iconButton}
            // Replace the problematic navigation with:
onPress={() => {
  if (user) {
    (router as any).push('/profile');
  } else {
    (router as any).push('/login');
  }
}}
          >
            <Ionicons name={user ? "person" : "log-in"} size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.avatarSection}>
            <Text style={styles.avatar}>{botAvatar}</Text>
          </View>
          <Text style={styles.welcomeTitle}>
            {user ? `Welcome back, ${user.name}!` : 'Welcome to Mindful Companion'}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            I'm here to listen, support, and help you through whatever you're feeling.
          </Text>
        </View>

        {/* Response Type Selection */}
        <View style={styles.selectionSection}>
          <Text style={styles.sectionTitle}>How would you like me to support you today?</Text>
          
          {RESPONSE_TYPES.map((type) => (
            // In the header section, replace the TouchableOpacity with:
<TouchableOpacity 
  style={styles.iconButton}
  onPress={() => {
    if (user) {
      router.navigate({
        pathname: '/profile',
      } as any);
    } else {
      router.navigate({
        pathname: '/login',
      } as any);
    }
  }}
>
  <Ionicons name={user ? "person" : "log-in"} size={20} color={colors.text} />
</TouchableOpacity>
          ))}
        </View>

        {/* Daily Games Section */}
        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>Daily Mood Boosters</Text>
          
          {DAILY_GAMES.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[styles.gameCard, { borderLeftColor: game.color }]}
              onPress={() => handleGameSelect(game)}
            >
              <Text style={styles.gameEmoji}>{game.emoji}</Text>
              <View style={styles.gameTextContainer}>
                <Text style={styles.gameName}>{game.name}</Text>
                <Text style={styles.gameDescription}>{game.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About Mindful Companion</Text>
          <Text style={styles.infoText}>
            • 100% ethical and safe conversations{'\n'}
            • No medical or legal advice{'\n'}
            • Privacy-focused with end-to-end encryption{'\n'}
            • Always here to listen, 24/7
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}