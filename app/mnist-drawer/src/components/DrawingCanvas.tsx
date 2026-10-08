import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  View,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Point = {
  x: number;
  y: number;
};

type Stroke = Point[];

type DrawingCanvasProps = {
  size: number;
};

export type DrawingCanvasRef = {
  clear: () => void;
};

const DrawingCanvas = forwardRef<
  DrawingCanvasRef,
  DrawingCanvasProps
>(({ size }, ref) => {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke>([]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      setStrokes([]);
      setCurrentStroke([]);
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
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (event) => {
        const point = getPoint(event);
        setCurrentStroke([point]);
      },

      onPanResponderMove: (event) => {
        const point = getPoint(event);

        setCurrentStroke((previous) => [
          ...previous,
          point,
        ]);
      },

      onPanResponderRelease: () => {
        setCurrentStroke((current) => {
          if (current.length > 0) {
            setStrokes((previous) => [
              ...previous,
              current,
            ]);
          }

          return [];
        });
      },

      onPanResponderTerminate: () => {
        setCurrentStroke([]);
      },
    }),
  ).current;

  const createPath = (stroke: Stroke) => {
    if (stroke.length === 0) {
      return '';
    }

    const [first, ...rest] = stroke;

    let path = `M ${first.x} ${first.y}`;

    for (const point of rest) {
      path += ` L ${point.x} ${point.y}`;
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
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {strokes.map((stroke, index) => (
          <Path
            key={`stroke-${index}`}
            d={createPath(stroke)}
            stroke="white"
            strokeWidth={size * 0.06}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}

        {currentStroke.length > 0 && (
          <Path
            d={createPath(currentStroke)}
            stroke="white"
            strokeWidth={size * 0.06}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}
      </Svg>
    </View>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    overflow: 'hidden',
  },
});

export default DrawingCanvas;
