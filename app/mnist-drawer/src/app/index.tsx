
import React, {
  useRef,
  useState,
} from 'react';

import {
  Button,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import ViewShot from 'react-native-view-shot';

import DrawingCanvas, {
  DrawingCanvasRef,
} from '../components/DrawingCanvas';

import {
  cropToBounds,
  findStrokeBounds,
} from './utils/preprocessImage';

const CANVAS_SIZE = 320;

const STROKE_WIDTH =
  CANVAS_SIZE * 0.06;

export default function HomeScreen() {
  const canvasRef =
    useRef<DrawingCanvasRef>(null);

  const viewShotRef =
    useRef<ViewShot>(null);



    
  const [
    processedImage,
    setProcessedImage,
  ] = useState<string | null>(null);

  const processDrawing =
    async () => {
      try {
        const strokes =
          canvasRef.current
            ?.getStrokes() ?? [];

        const bounds =
          findStrokeBounds(
            strokes,
            STROKE_WIDTH,
          );

        console.log(
          'Bounds do desenho:',
          bounds,
        );

        if (!bounds) {
          console.log(
            'Nenhum desenho encontrado.',
          );

          return;
        }

        const uri =
          await viewShotRef.current?.capture({
            format: 'png',
            quality: 1,
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
          });

        if (!uri) {
          throw new Error(
            'Não foi possível capturar o canvas.',
          );
        }

        console.log(
          'Imagem original:',
          uri,
        );

        const croppedUri =
          await cropToBounds(
            uri,
            bounds,
            CANVAS_SIZE,
            20,
          );

        console.log(
          'Imagem recortada:',
          croppedUri,
        );

        setProcessedImage(
          croppedUri,
        );

        canvasRef.current?.clear();
      } catch (error) {
        console.error(
          'Erro ao processar:',
          error,
        );
      }
    };

  const clearCanvas = () => {
    canvasRef.current?.clear();
    setProcessedImage(null);
  };

  return (
    <SafeAreaView
      style={styles.container}
    >
      <View
        style={styles.content}
      >
        <Text
          style={styles.title}
        >
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
            size={CANVAS_SIZE}
          />
        </ViewShot>

        <View
          style={styles.buttons}
        >
          <Button
            title="Processar"
            onPress={
              processDrawing
            }
          />

          <Button
            title="Limpar"
            onPress={
              clearCanvas
            }
          />
        </View>

        {processedImage && (
          <View
            style={
              styles.previewContainer
            }
          >
            <Text
              style={
                styles.previewTitle
              }
            >
              Recorte do dígito
            </Text>

            <Image
              source={{
                uri: processedImage,
              }}
              style={styles.preview}
              resizeMode="contain"
            />
          </View>
        )}
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

  previewContainer: {
    alignItems: 'center',
    gap: 10,
  },

  previewTitle: {
    color: 'white',
    fontSize: 16,
  },

  preview: {
    width: 280,
    height: 280,
    backgroundColor: 'black',
  },
});
