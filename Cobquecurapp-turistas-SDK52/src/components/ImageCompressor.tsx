import React, { useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

interface ImageCompressorProps {
  onImageCompressed: (uri: string) => void;
  initialImageUri?: string;
  isButtonDisabled?:boolean;
}
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ImageCompressor: React.FC<ImageCompressorProps> = ({ onImageCompressed, initialImageUri, isButtonDisabled }) => {
  const [imageUri, setImageUri] = useState<string | null>(`${initialImageUri}?timestamp=${new Date().getTime()}` || null);

  const pickAndCompressImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const compressedImage = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 300, height: 300 } }], // Redimensiona la imagen a 100x100 px
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Ajusta la calidad de compresión si es necesario
      );

      // Obtener el tamaño del archivo comprimido
      const fileInfo = await FileSystem.getInfoAsync(compressedImage.uri);

      if (fileInfo.exists && !fileInfo.isDirectory) {
        const fileSize = fileInfo.size || 0;

        const base64 = await FileSystem.readAsStringAsync(compressedImage.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        // console.log("imagen en base 64------------------------", base64);

        // Actualizar la vista y pasar la imagen comprimida en base64
        setImageUri(`${compressedImage.uri}?timestamp=${new Date().getTime()}`);
        onImageCompressed(base64);
        //   Alert.alert('Imagen comprimida', `Tamaño: ${fileSize} bytes`);
      } else {
        Alert.alert('Error', 'No se pudo obtener el tamaño del archivo.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickAndCompressImage} style={styles.imagePickerButton} disabled={!isButtonDisabled}>
        {/* <Text style={styles.imagePickerButtonText}>Seleccionar Imagen</Text> */}
        {imageUri && initialImageUri !== API_URL && !initialImageUri?.endsWith('null')?<Image source={{ uri: imageUri }} style={styles.imagePreview} /> :  <Image source={require('../../assets/noImageAvailable.png')} style={styles.imagePreview} />}
        {initialImageUri == API_URL? <Image source={require('../../assets/noImageAvailable.png')} style={styles.imagePreview} />: ''}
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerButton: {
    // backgroundColor: '#007a8c',

    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  imagePreview: {
    borderColor: '#acd0d5',
    borderWidth: 1,
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop:10
  },
});

export default ImageCompressor;
