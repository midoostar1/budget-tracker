import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { theme } from '../theme';

interface FloatingActionButtonProps {
  onAddManual: () => void;
  onScanReceipt: () => void;
}

export function FloatingActionButton({
  onAddManual,
  onScanReceipt,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;

    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();

    setIsOpen(!isOpen);
  };

  const handleAddManual = () => {
    toggleMenu();
    onAddManual();
  };

  const handleScanReceipt = () => {
    toggleMenu();
    onScanReceipt();
  };

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const manualButtonTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -70],
  });

  const scanButtonTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -140],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      {/* Overlay */}
      {isOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}

      {/* Action Buttons */}
      <Animated.View
        style={[
          styles.actionButton,
          styles.scanButton,
          {
            transform: [{ translateY: scanButtonTranslateY }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.actionButtonTouchable}
          onPress={handleScanReceipt}
        >
          <Text style={styles.actionButtonIcon}>📷</Text>
        </TouchableOpacity>
        <Text style={styles.actionLabel}>Scan Receipt</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.actionButton,
          styles.addButton,
          {
            transform: [{ translateY: manualButtonTranslateY }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.actionButtonTouchable}
          onPress={handleAddManual}
        >
          <Text style={styles.actionButtonIcon}>💰</Text>
        </TouchableOpacity>
        <Text style={styles.actionLabel}>Add Manual</Text>
      </Animated.View>

      {/* Main FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Animated.Text
          style={[
            styles.fabIcon,
            {
              transform: [{ rotate: rotation }],
            },
          ]}
        >
          +
        </Animated.Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 70,
    right: theme.spacing.lg,
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
    elevation: 8,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 32,
    fontWeight: theme.fontWeight.bold,
    lineHeight: 32,
  },
  actionButton: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    right: 0,
  },
  addButton: {
    bottom: 0,
  },
  scanButton: {
    bottom: 0,
  },
  actionButtonTouchable: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
    elevation: 6,
  },
  actionButtonIcon: {
    fontSize: 24,
  },
  actionLabel: {
    position: 'absolute',
    right: 60,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    ...theme.shadows.sm,
    elevation: 4,
  },
});

