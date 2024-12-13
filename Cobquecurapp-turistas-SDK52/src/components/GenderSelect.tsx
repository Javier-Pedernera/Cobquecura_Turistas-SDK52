import { useState } from 'react';
import { View, TextInput, StyleSheet, Dimensions } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Icon from '@expo/vector-icons/Feather';

interface GenderSelectProps {
  selectedGender: string;
  otherGender: string;
  onGenderChange: (gender: string) => void;
  onOtherGenderChange: (otherGender: string) => void;
}
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GenderSelect: React.FC<GenderSelectProps> = ({
  selectedGender,
  otherGender,
  onGenderChange,
  onOtherGenderChange,
}) => {
  const [showOtherGender, setShowOtherGender] = useState(selectedGender === 'other');

  const handleGenderChange = (value: string) => {
    setShowOtherGender(value === 'other');
    onGenderChange(value);
  };

  return (
    <View>
      <View style={styles.pickerWrapper}>
        <RNPickerSelect
          onValueChange={handleGenderChange}
          items={[
            { label: 'Masculino', value: 'Masculino' },
            { label: 'Femenino', value: 'Femenino' },
            { label: 'Otro', value: 'other' },
          ]}
          placeholder={{ label: 'Seleccione Género', value: '' }}
          value={selectedGender}
          style={{
            ...pickerSelectStyles,
            iconContainer: {
                position: 'absolute',
                right: 15,
                top: '50%',
                transform: [{ translateY: -12 }],
              },
          }}
          useNativeAndroidPickerStyle={false}
          Icon={() => {
            return <Icon name="chevron-down" size={26} color="#007a8c" />;
          }}
        />
      </View>
      {showOtherGender && (
        <TextInput
          style={styles.input}
          placeholder="Especificar género"
          placeholderTextColor="#aaa"
          value={otherGender}
          onChangeText={onOtherGenderChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pickerWrapper: {
    marginBottom: 10,
    shadowColor: '#007a8c',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    height: 48,
    alignContent: 'center',
    borderWidth: 1,
    borderColor: 'rgb(172, 208, 213)',
    borderRadius: 8,
    backgroundColor: '#fff',
    
  },
  input: {
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: screenWidth*0.04,
    shadowColor: '#007a8c',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    height: 48,
    alignContent: 'center',
    borderWidth: 1,
    borderColor: 'rgb(172, 208, 213)',
    paddingHorizontal: 12,
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: screenWidth*0.04,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    color: '#000',
    height:48,
  },
  inputAndroid: {
    fontSize: screenWidth*0.04,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    color: '#000',
    height:48,
    width:screenWidth*0.9,
  },
};

export default GenderSelect;