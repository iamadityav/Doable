import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStreak } from '../hooks/useStreak';
import { useTasks } from '../hooks/useTask';
import { Header } from '../components/Header';

// --- Ultra Clean Minimal Theme ---
const COLORS = {
  // Background
  background: '#FFFFFF',
  cardDefault: '#FBFBFB',
  cardSecondary: '#F9FAFB',
  
  // Text hierarchy
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  // Accent colors
  primary: '#4F46E5',
  success: '#059669',
  warning: '#EA580C',
  streak: '#F59E0B',
  
  // Subtle borders and dividers
  border: '#F3F4F6',
  borderActive: '#E5E7EB',
  
  // Gradients and highlights
  streakGlow: '#FEF3C7',
  primaryGlow: '#EEF2FF',
  successGlow: '#ECFDF5',
  
  // Shadows
  shadowLight: 'rgba(0, 0, 0, 0.04)',
  shadowMedium: 'rgba(0, 0, 0, 0.08)',
};

const SPACING = {
  xs: 6,
  s: 10,
  m: 16,
  l: 20,
  xl: 24,
  xxl: 32,
};

const TYPOGRAPHY = {
  hero: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.1,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  micro: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
    textTransform: 'uppercase' as const,
  },
  streakNumber: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -2,
    lineHeight: 56,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 28,
  },
};

// --- Reusable Components ---
const CleanIcon: React.FC<{ name: string; size: number; color?: string }> = ({ name, size, color = COLORS.textPrimary }) => {
  const getEmoji = (iconName: string) => ({
    'fire': '🔥', 
    'trophy': '🏆', 
    'check': '✅',
    'target': '🎯',
    'calendar': '📅',
  }[iconName] || '•');
  
  return <Text style={{ fontSize: size, color, lineHeight: size + 2 }}>{getEmoji(name)}</Text>;
};

// --- Screen-Specific Components ---
const StreakHero: React.FC<{ streak: number }> = ({ streak }) => (
  <View style={styles.heroContainer}>
    <View style={styles.streakCircle}>
      <View style={styles.streakGlow}>
        <CleanIcon name="fire" size={32} color={COLORS.streak} />
        <Text style={styles.streakNumber}>{streak}</Text>
        <Text style={styles.streakLabel}>Day Streak</Text>
      </View>
    </View>
    <View style={styles.heroTextContainer}>
      <Text style={styles.heroTitle}>Keep the momentum!</Text>
      <Text style={styles.heroSubtitle}>You're building great habits</Text>
    </View>
  </View>
);

const StatCard: React.FC<{ 
  icon: string; 
  value: string | number; 
  label: string; 
  color: string;
  accent: string;
}> = ({ icon, value, label, color, accent }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconContainer, { backgroundColor: accent }]}>
      <CleanIcon name={icon} size={20} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const InspirationCard: React.FC = () => (
  <View style={styles.inspirationCard}>
    <View style={styles.inspirationContent}>
      <Text style={styles.inspirationText}>
        "The secret of getting ahead is getting started."
      </Text>
      <Text style={styles.inspirationAuthor}>— Mark Twain</Text>
    </View>
  </View>
);

const ProgressMetrics: React.FC<{ 
  currentStreak: number; 
  longestStreak: number; 
  tasksCompleted: number; 
}> = ({ currentStreak, longestStreak, tasksCompleted }) => (
  <View style={styles.metricsContainer}>
    <Text style={styles.sectionTitle}>Your Progress</Text>
    <View style={styles.metricsGrid}>
      <StatCard 
        icon="calendar" 
        value={currentStreak} 
        label="Current Streak" 
        color={COLORS.streak}
        accent={COLORS.streakGlow}
      />
      <StatCard 
        icon="trophy" 
        value={longestStreak} 
        label="Best Streak" 
        color={COLORS.primary}
        accent={COLORS.primaryGlow}
      />
    </View>
    <View style={styles.singleMetricContainer}>
      <StatCard 
        icon="target" 
        value={tasksCompleted} 
        label="Total Tasks Completed" 
        color={COLORS.success}
        accent={COLORS.successGlow}
      />
    </View>
  </View>
);

// --- Main Screen Component ---
const StreakTrackerScreen: React.FC = () => {
  const { streak } = useStreak();
  const { tasks } = useTasks();

  const totalTasksCompleted = tasks.filter(t => t.completed).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Streak Tracker" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StreakHero streak={streak.currentStreak} />
        
        <ProgressMetrics 
          currentStreak={streak.currentStreak}
          longestStreak={streak.longestStreak}
          tasksCompleted={totalTasksCompleted}
        />
        
        <InspirationCard />
        
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Clean Minimal Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
  },
  
  // Hero Section
  heroContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  streakCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.cardDefault,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.l,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakGlow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakNumber: {
    ...TYPOGRAPHY.streakNumber,
    color: COLORS.textPrimary,
    marginVertical: SPACING.xs,
  },
  streakLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  heroTextContainer: {
    alignItems: 'center',
  },
  heroTitle: {
    ...TYPOGRAPHY.hero,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  
  // Metrics Section
  metricsContainer: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
    marginBottom: SPACING.m,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: SPACING.s,
    marginBottom: SPACING.s,
  },
  singleMetricContainer: {
    alignItems: 'center',
  },
  
  // Stat Card
  statCard: {
    backgroundColor: COLORS.cardDefault,
    borderRadius: 12,
    padding: SPACING.m,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.s,
  },
  statValue: {
    ...TYPOGRAPHY.statNumber,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  
  // Inspiration Card
  inspirationCard: {
    backgroundColor: COLORS.cardDefault,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  inspirationContent: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  inspirationText: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.m,
    lineHeight: 24,
  },
  inspirationAuthor: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default StreakTrackerScreen;