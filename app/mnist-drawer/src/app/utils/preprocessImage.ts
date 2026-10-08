import * as ImageManipulator from 'expo-image-manipulator';

export async function resizeTo28x28(
  imageUri: string,
): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    imageUri,
    [
      {
        resize: {
          width: 28,
          height: 28,
        },
      },
    ],
    {
      compress: 1,
      format: ImageManipulator.SaveFormat.PNG,
    },
  );

  return result.uri;
}
