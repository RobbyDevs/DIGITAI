
import { Image } from 'react-native';

import * as ImageManipulator
  from 'expo-image-manipulator';

export type Point = {
  x: number;
  y: number;
};

export type Stroke = Point[];

export type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export function findStrokeBounds(
  strokes: Stroke[],
  strokeWidth: number,
): Bounds | null {
  if (strokes.length === 0) {
    return null;
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const stroke of strokes) {
    for (const point of stroke) {
      minX = Math.min(
        minX,
        point.x,
      );

      minY = Math.min(
        minY,
        point.y,
      );

      maxX = Math.max(
        maxX,
        point.x,
      );

      maxY = Math.max(
        maxY,
        point.y,
      );
    }
  }

  if (!Number.isFinite(minX)) {
    return null;
  }

  const radius =
    strokeWidth / 2;

  return {
    minX: minX - radius,
    minY: minY - radius,
    maxX: maxX + radius,
    maxY: maxY + radius,
  };
}

export async function cropToBounds(
  imageUri: string,
  bounds: Bounds,
  canvasSize: number,
  margin: number = 20,
): Promise<string> {
  const imageSize =
    await new Promise<{
      width: number;
      height: number;
    }>((resolve, reject) => {
      Image.getSize(
        imageUri,
        (width, height) => {
          resolve({
            width,
            height,
          });
        },
        reject,
      );
    });

  const scaleX =
    imageSize.width / canvasSize;

  const scaleY =
    imageSize.height / canvasSize;

  const minX = Math.max(
    0,
    Math.floor(
      (bounds.minX - margin) *
        scaleX,
    ),
  );

  const minY = Math.max(
    0,
    Math.floor(
      (bounds.minY - margin) *
        scaleY,
    ),
  );

  const maxX = Math.min(
    imageSize.width,
    Math.ceil(
      (bounds.maxX + margin) *
        scaleX,
    ),
  );

  const maxY = Math.min(
    imageSize.height,
    Math.ceil(
      (bounds.maxY + margin) *
        scaleY,
    ),
  );

  const width =
    maxX - minX;

  const height =
    maxY - minY;

  if (
    width <= 0 ||
    height <= 0
  ) {
    throw new Error(
      'Área de recorte inválida.',
    );
  }

  console.log(
    'Bounds do canvas:',
    bounds,
  );

  console.log(
    'Tamanho da imagem:',
    imageSize,
  );

  console.log(
    'Crop convertido:',
    {
      minX,
      minY,
      width,
      height,
      scaleX,
      scaleY,
    },
  );

  const result =
    await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          crop: {
            originX: minX,
            originY: minY,
            width,
            height,
          },
        },
      ],
      {
        compress: 1,
        format:
          ImageManipulator.SaveFormat.PNG,
      },
    );

  return result.uri;
}
