import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import {
  GestureResponderEvent,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';

import {
  Canvas,
  Path,
  Skia,
} from '@shopify/react-native-skia';

export type Point = {
  x: number;
  y: number;
};

export type Stroke = Point[];

type DrawingCanvasProps = {
  size: number;
};

const STROKE_WIDTH_RATIO = 0.06;

export type DrawingCanvasRef = {
  clear: () => void;
  getStrokes: () => Stroke[];
};

const DrawingCanvas = forwardRef<
  DrawingCanvasRef,
  DrawingCanvasProps
>(({ size }, ref) => {
  const [strokes, setStrokes] =
    useState<Stroke[]>([]);

  const [currentStroke, setCurrentStroke] =
    useState<Stroke>([]);

  const strokeWidth =
    size * STROKE_WIDTH_RATIO;

  useImperativeHandle(ref, () => ({
    clear: () => {
      setStrokes([]);
      setCurrentStroke([]);
    },

    getStrokes: () => {
      return strokes;
    },
  }));

  const getPoint = (
    event: GestureResponderEvent,
  ): Point => {
    return {
      x: event.nativeEvent.locationX,
      y: event.nativeEvent.locationY,
    };
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder:
        () => true,

      onMoveShouldSetPanResponder:
        () => true,

      onPanResponderGrant: (
        event: GestureResponderEvent,
      ) => {
        setCurrentStroke([
          getPoint(event),
        ]);
      },

      onPanResponderMove: (
        event: GestureResponderEvent,
      ) => {
        const point =
          getPoint(event);

        setCurrentStroke(
          previous => [
            ...previous,
            point,
          ],
        );
      },

      onPanResponderRelease: () => {
        setCurrentStroke(
          current => {
            if (current.length > 0) {
              setStrokes(
                previous => [
                  ...previous,
                  current,
                ],
              );
            }

            return [];
          },
        );
      },

      onPanResponderTerminate: () => {
        setCurrentStroke([]);
      },
    }),
  ).current;

  const createPath = (
    stroke: Stroke,
  ) => {
    const path =
      Skia.Path.Make();

    if (stroke.length === 0) {
      return path;
    }

    path.moveTo(
      stroke[0].x,
      stroke[0].y,
    );

    for (
      let i = 1;
      i < stroke.length;
      i++
    ) {
      path.lineTo(
        stroke[i].x,
        stroke[i].y,
      );
    }

    return path;
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Canvas
        style={{
          width: size,
          height: size,
        }}
      >
        {strokes.map(
          (stroke, index) => (
            <Path
              key={`stroke-${index}`}
              path={createPath(stroke)}
              color="white"
              style="stroke"
              strokeWidth={strokeWidth}
              strokeCap="round"
              strokeJoin="round"
            />
          ),
        )}

        {currentStroke.length > 0 && (
          <Path
            path={createPath(
              currentStroke,
            )}
            color="white"
            style="stroke"
            strokeWidth={strokeWidth}
            strokeCap="round"
            strokeJoin="round"
          />
        )}
      </Canvas>
    </View>
  );
});

DrawingCanvas.displayName =
  'DrawingCanvas';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    overflow: 'hidden',
  },
});

export default DrawingCanvas;
