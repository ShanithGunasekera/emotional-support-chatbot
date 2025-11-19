import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import { setBotAvatar } from '../src/store/chatSlice';
import { Ionicons } from '@expo/vector-icons';

const AVATAR_OPTIONS = ['🤖', '👤', '😊', '🐶', '🐱', '🌈', '🌻', '🎮', '📚', '🎵'];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateAvatar } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const botAvatar = useSelector((state: any) => state.chat.botAvatar);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.back();
          }
        },
      ]
    );
  };

  const handleAvatarSelect = (avatar: string) => {
    dispatch(setBotAvatar(avatar));
    if (user) {
      updateAvatar(avatar);
    }
  };

  // Simple navigation fix - use 'as any' to bypass TypeScript
  const navigateToLogin = () => {
    (router as any).push('/login');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 24,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    currentAvatar: {
      fontSize: 64,
      marginBottom: 16,
    },
    userName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    userEmail: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    avatarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    avatarOption: {
      width: '18%',
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    avatarOptionSelected: {
      borderColor: colors.primary,
    },
    avatarText: {
      fontSize: 20,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    settingText: {
      fontSize: 16,
      color: colors.text,
    },
    logoutButton: {
      backgroundColor: colors.error,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
    },
    logoutText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Info */}
        <View style={styles.header}>
          <Text style={styles.currentAvatar}>{botAvatar}</Text>
          <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'Not signed in'}</Text>
        </View>

        {/* Avatar Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Companion Avatar</Text>
          <View style={styles.avatarGrid}>
            {AVATAR_OPTIONS.map((avatar) => (
              <TouchableOpacity
                key={avatar}
                style={[
                  styles.avatarOption,
                  botAvatar === avatar && styles.avatarOptionSelected,
                ]}
                onPress={() => handleAvatarSelect(avatar)}
              >
                <Text style={styles.avatarText}>{avatar}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <TouchableOpacity style={styles.settingRow} onPress={toggleTheme}>
            <Text style={styles.settingText}>Dark Mode</Text>
            <Ionicons 
              name={isDark ? "toggle" : "toggle-outline"} 
              size={24} 
              color={isDark ? colors.primary : colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {!user ? (
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={navigateToLogin}
            >
              <Text style={styles.settingText}>Sign In</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
              <Text style={[styles.settingText, { color: colors.error }]}>Logout</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Mindful Companion</Text>
          <Text style={[styles.settingText, { marginBottom: 12 }]}>
            Version 2.0.0
          </Text>
          <Text style={[styles.settingText, { fontSize: 14, color: colors.textSecondary }]}>
            Your AI-powered emotional support companion. 
            Always here to listen, support, and help you through your journey.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}