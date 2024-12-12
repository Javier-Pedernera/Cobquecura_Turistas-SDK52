import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useDispatch, useSelector } from 'react-redux';
import { getMemoizedCountries } from '../redux/selectors/countrySelectors';
import { AppDispatch, RootState } from '../redux/store/store';
import { fetchCountries } from '../redux/actions/countryActions';
import Icon from '@expo/vector-icons/Feather';

interface CountryPickerProps {
  selectedCountry: string;
  onCountryChange: (value: string) => void;
  estilo: boolean;
}
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CountryPicker: React.FC<CountryPickerProps> = ({ selectedCountry, onCountryChange, estilo }) => {
  const dispatch = useDispatch<AppDispatch>();
  const countries = useSelector((state: RootState) => getMemoizedCountries(state));

  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  const countryOptions = countries.map((country: any) => ({
    label: country.name,
    value: country.name,
  }));

  return (
    <View style={styles.container}>
      <View style={estilo && styles.pickerWrapper}>
        <RNPickerSelect
          placeholder={{
            label: '* Seleccione un país',
            value: '',
            color: '#9EA0A4'
          }}
          items={countryOptions}
          onValueChange={onCountryChange}
          value={selectedCountry}
          style={{
            ...pickerStyles,
            iconContainer: {
                  position: 'absolute',
                  right: 15,
                  top: '50%',
                  transform: [{ translateY: -12 }],
                }
          }}
          useNativeAndroidPickerStyle={false}
          Icon={() => {
            return <Icon name="chevron-down" size={26} color="#007a8c" />;
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 5,
    marginTop: 5
  },
  pickerWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
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
  },
});

const pickerStyles = StyleSheet.create({
  inputIOS: {
    fontSize: screenWidth*0.04,
    paddingVertical: 8,
    paddingHorizontal: 15,
    color: '#333',
    paddingRight: 30,
    width:screenWidth*0.9,
    
    borderRadius: 8,
    height:48,
    alignItems:'center',
    justifyContent:'center'
  },
  inputAndroid: {
    fontSize: screenWidth*0.04,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: '#333',
    paddingRight: 30,
    height:48,
    alignItems:'center',
    justifyContent:'center',
    width:screenWidth*0.9,
  },
  placeholder: {
    color: '#9EA0A4',
    fontSize: screenWidth*0.04,
  },
});

export default CountryPicker;
