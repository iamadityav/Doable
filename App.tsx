import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import your screens
import TodayScreen from './src/screens/TodayScreen';
import UpcomingScreen from './src/screens/UpcomingScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LogbookScreen from './src/screens/LogbookScreen';
import FocusScreen from './src/screens/FocusScreen'; // Import the new FocusScreen

// --- App Colors ---
const COLORS = {
  primary: '#007AFF',
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
};

// --- Updated Tab Configuration ---
const tabs = [
  { id: 'today', name: 'Today', icon: '📅' },
  { id: 'upcoming', name: 'Upcoming', icon: '⏰' },
  { id: 'focus', name: 'Focus', icon: '🎯' }, // Replaced Areas with Focus
  { id: 'settings', name: 'Settings', icon: '⚙️' },
];

// --- Main App Component ---
function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('today');

  const navigateTo = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'today':
        return <TodayScreen />;
      case 'upcoming':
        return <UpcomingScreen />;
      case 'focus':
        return <FocusScreen />; // Render the new FocusScreen
      case 'settings':
        return <SettingsScreen navigateTo={navigateTo} />;
      case 'logbook':
        return <LogbookScreen />;
      default:
        return <TodayScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />
      <View style={styles.container}>
        <View style={styles.content}>
          {renderScreen()}
        </View>

        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={{ fontSize: 24 }}>{tab.icon}</Text>
              <Text
                style={[
                  styles.tabLabel,
                  { color: activeTab === tab.id ? COLORS.primary : COLORS.textSecondary },
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderTopColor: '#E5E5EA',
    borderTopWidth: 0.5,
    paddingBottom: 6,
    paddingTop: 6,
    height: 84,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 10, fontWeight: '500', marginTop: 2 },
});

export default App;
