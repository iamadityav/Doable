import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Header } from '../components/Header'; // Import the common Header

// Colors from blueprint
const COLORS = {
  primary: '#007AFF',
  background: '#FFFFFF', // Changed to white
  card: '#FFFFFF',
  success: '#34C759',
  purple: '#AF52DE',
  warning: '#FF9500',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#E5E5EA', // Grey border color
  deadline: '#FF3B30',
};

// Spacing from blueprint
const SPACING = {
  xs: 8,
  s: 16,
  m: 24,
};

// --- Reusable Components ---

const SimpleIcon: React.FC<{ name: string; size: number; color?: string; style?: object }> = ({ 
  name, 
  size, 
  color = COLORS.text,
  style 
}) => {
  const getEmoji = (iconName: string) => {
    switch (iconName) {
      case 'logbook': return '📖';
      case 'mood': return '😊';
      case 'export': return '📤';
      case 'star': return '🌟';
      case 'restore': return '🛍️';
      case 'notifications': return '🔔';
      case 'appearance': return '🎨';
      case 'areas': return '📊';
      case 'feedback': return '✉️';
      case 'info': return 'ℹ️';
      case 'chevron': return '›';
      default: return '•';
    }
  };

  return (
    <Text style={[{ fontSize: size, color, textAlign: 'center' }, style]}>
      {getEmoji(name)}
    </Text>
  );
};

interface SettingsRowProps {
  icon: string;
  iconColor: string;
  title: string;
  onPress: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ icon, iconColor, title, onPress, isFirst, isLast }) => {
  const rowStyle = [
    styles.settingsRow,
    isFirst && styles.firstRow,
    isLast && styles.lastRow,
    !isLast && styles.rowSeparator,
  ];

  return (
    <TouchableOpacity style={rowStyle} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        <SimpleIcon name={icon} size={16} color={COLORS.card} />
      </View>
      <Text style={styles.rowTitle}>{title}</Text>
      <SimpleIcon name="chevron" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
};

const ProRow: React.FC<{ onPress: () => void; isFirst?: boolean; isLast?: boolean; }> = ({ onPress, isFirst, isLast }) => (
  <TouchableOpacity onPress={onPress}>
    <LinearGradient
      colors={['#6EB5FF', '#AF52DE']}
      style={[
        styles.settingsRow, 
        isFirst && styles.firstRow,
        isLast && styles.lastRow,
        !isLast && styles.rowSeparator,
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.iconContainer}>
         <SimpleIcon name="star" size={16} color={COLORS.warning} />
      </View>
      <Text style={[styles.rowTitle, styles.proText]}>Upgrade to Pro</Text>
    </LinearGradient>
  </TouchableOpacity>
);


// --- Main Screen Component ---

const SettingsScreen: React.FC = ({navigateTo}) => {
  const appVersion = '1.0.0 (Build 1)';

  // const navigateTo = (screen: string) => console.log(`Navigating to ${screen}`);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Settings" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* Section 1: Your Data */}
          <Text style={styles.sectionTitle}>Your Data</Text>
          <View style={styles.section}>
            <SettingsRow 
              icon="logbook" 
              iconColor={COLORS.primary} 
              title="Logbook" 
              onPress={() => navigateTo('logbook')} 
              isFirst 
            />
            <SettingsRow 
              icon="mood" 
              iconColor={COLORS.success} 
              title="Streak Tracker" 
              onPress={() => navigateTo('Streaks')} 
            />
          </View>
          
          {/* Section 2: Pro Account */}
          <Text style={styles.sectionTitle}>Pro Account</Text>
          <View style={styles.section}>
            <ProRow onPress={() => console.log('Show Pro modal')} isFirst />
            <SettingsRow 
              icon="restore" 
              iconColor={COLORS.purple} 
              title="Restore Purchases" 
              onPress={() => console.log('Restore Purchases')}
              isLast
            />
          </View>

          {/* Section 3: General */}
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.section}>
            <SettingsRow 
              icon="notifications" 
              iconColor={COLORS.warning} 
              title="Notifications" 
              onPress={() => console.log('Navigate to Notifications')}
              isFirst
            />
            <SettingsRow 
              icon="appearance" 
              iconColor={COLORS.primary} 
              title="Appearance" 
              onPress={() => console.log('Navigate to Appearance')}
            />
            <SettingsRow 
              icon="areas" 
              iconColor={COLORS.success} 
              title="Manage Areas" 
              onPress={() => console.log('Navigate to Manage Areas')}
              isLast
            />
          </View>

          {/* Section 4: About */}
          <Text style={styles.sectionTitle}>About</Text>
           <View style={styles.section}>
            <SettingsRow 
              icon="feedback" 
              iconColor={COLORS.purple} 
              title="Send Feedback" 
              onPress={() => console.log('Open Feedback')}
              isFirst
            />
            <SettingsRow 
              icon="info" 
              iconColor={COLORS.textSecondary} 
              title="About Doable" 
              onPress={() => console.log('Open About screen')}
              isLast
            />
          </View>

          <Text style={styles.footerText}>Doable v{appVersion}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.s,
    gap: SPACING.m,
  },
  sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.textSecondary,
      marginLeft: SPACING.s,
      marginBottom: SPACING.xs,
      textTransform: 'uppercase',
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.s,
    minHeight: 52,
    backgroundColor: COLORS.card,
  },
  rowSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  firstRow: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lastRow: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.s,
  },
  rowTitle: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  proText: {
    color: COLORS.card,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.m,
    paddingBottom: SPACING.m,
  },
});

export default SettingsScreen;
