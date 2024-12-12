import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CustomDatePickerProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date) => void;
  placeholder?: string;
}
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ selectedDate, onDateChange, placeholder }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'ios') {
      onDateChange(date || selectedDate || new Date());
    } else {
      if (date) {
        onDateChange(date);
      }
      setShowDatePicker(false);
    }
  };

  const confirmDate = () => {
    setShowDatePicker(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputdate}>
        <Text style={selectedDate ? styles.textDate: styles.textDateplaceholder}>
          {selectedDate ? selectedDate.toLocaleDateString() : placeholder || 'Select Date'}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <Modal
          isVisible={showDatePicker}
          onBackdropPress={() => setShowDatePicker(false)}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          backdropOpacity={0.5}
        >
          <View style={styles.modalPickerContent}>
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity onPress={confirmDate} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>Confirmar fecha</Text>
              </TouchableOpacity>
            )}
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  inputdate: {
    borderWidth: 1,
    borderColor: 'rgb(172, 208, 213)',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    height:48,
    justifyContent:'center'
  },
  textDate: {
    color: '#000',
    marginLeft:5,
    fontSize: screenWidth*0.04,
  },
  textDateplaceholder:{
    marginLeft:5,
    fontSize: screenWidth*0.04,
    color: '#adadad',
  },
  modalPickerContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButton: {
    marginTop: 10,
    backgroundColor: '#007a8c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CustomDatePicker;