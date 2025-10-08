import React, { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isReady, setIsReady] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    requestPermission();
    return <View />;
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} onCameraReady={() => setIsReady(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }
});
