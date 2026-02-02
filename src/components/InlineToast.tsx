import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

type InlineToastProps = {
  message: string;
  visible: boolean;
};

export default function InlineToast({ message, visible }: InlineToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      opacity.setValue(0);
      return;
    }

    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [visible, opacity]);

  return (
    <Animated.View style={[styles.toast, { opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  text: {
    fontSize: 12,
    color: '#6f6258',
  },
});
