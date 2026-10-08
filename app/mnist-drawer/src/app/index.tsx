
import React, { useRef } from 'react';
import {
  Alert,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ViewShot from 'react-native-view-shot';

import DrawingCanvas, {
  DrawingCanvasRef,
} from '../components/DrawingCanvas';

export default function HomeScreen() {
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const viewShotRef = useRef<ViewShot>(null);

  const processDrawing = async () => {
    try {
      const uri = await viewShotRef.current?.capture({
        format: 'png',
        quality: 1,
      });

      if (!uri) {
        throw new Error(
          'Não foi possível capturar o canvas.',
        );
      }

      console.log('Imagem capturada:', uri);

      // Limpa o canvas depois da captura.
      canvasRef.current?.clear();

      Alert.alert(
        'Canvas capturado',
        'O desenho foi capturado e o canvas foi limpo.',
      );
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Erro',
        'Não foi possível processar o desenho.',
      );
    }
  };

  const clearCanvas = () => {
    canvasRef.current?.clear();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          MNIST Drawer
        </Text>

        <ViewShot
          ref={viewShotRef}
          options={{
            format: 'png',
            quality: 1,
          }}
        >
          <DrawingCanvas
            ref={canvasRef}
            size={320}
          />
        </ViewShot>

        <View style={styles.buttons}>
          <Button
            title="Processar"
            onPress={processDrawing}
          />

          <Button
            title="Limpar"
            onPress={clearCanvas}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#202020',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },

  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: '600',
  },

  buttons: {
    flexDirection: 'row',
    gap: 20,
  },
});

