import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView, Modal, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store/store';
import RNPickerSelect from 'react-native-picker-select';
import { UserData } from '../redux/types/types';
import { updateUserAction } from '../redux/actions/userActions';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchUserCategories, fetchAllCategories } from '../redux/actions/categoryActions';
import Checkbox from 'expo-checkbox';
import { updateTourist } from '../services/touristService';
import { MaterialIcons } from '@expo/vector-icons';
import { getMemoizedUserData } from '../redux/selectors/userSelectors';
import { getMemoizedAllCategories, getMemoizedUserCategories } from '../redux/selectors/categorySelectors';
import { formatDateToDDMMYYYY } from '../utils/formatDate';
import CountryPicker from '../components/CountrySelect';
import ImageCompressor from '../components/ImageCompressor';
import SemicirclesOverlay from '../components/SemicirclesOverlay';
import ErrorModal from '../components/ErrorModal';
import ExitoModal from '../components/ExitoModal';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Loader from '../components/Loader';

const { width: screenWidth } = Dimensions.get('window');
// const screenHeight = Dimensions.get('window').height;
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const ProfileScreen: React.FC = () => {
  const user = useSelector(getMemoizedUserData) as UserData;
  const categories = useSelector(getMemoizedUserCategories);
  const allCategories = useSelector(getMemoizedAllCategories);
  const dispatch: AppDispatch = useDispatch();
  const [isEditable, setIsEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // console.log("categorias de usuario",categories);
  // console.log("usuario en el profile",user);
  const [selectedCategories, setSelectedCategories] = useState<any>(categories.map(cat => cat.id)
  );
  // console.log("categorias seleccionadas",selectedCategories);
  // console.log("allCategories",allCategories);
  useEffect(() => {
    if (user?.user_id) {
      dispatch(fetchUserCategories(user.user_id));
    }
    dispatch(fetchAllCategories());
  }, [dispatch, user?.user_id]);

  useEffect(() => {
    setSelectedCategories(categories.map(cat => cat.id));
  }, [categories]);
  console.log(user);

  const [formData, setFormData] = useState({
    user_id: user?.user_id || 0,
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    country: user?.country || '',
    city: user?.city || '',
    phone_number: user?.phone_number || '',
    gender: user?.gender || '',
    birth_date: user?.birth_date || '',
    image_data: `${API_URL}${user?.image_url}` || null,
    subscribed_to_newsletter: user?.subscribed_to_newsletter || false,
  });
  // console.log("datos a cambiar en el perfil y la imagen",formData, formData.image_data);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalError, setModalError] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isCategoriesModalVisible, setCategoriesModalVisible] = useState(false);
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [modalErrorMessage, setModaErrorlMessage] = useState('');
  const [modalSuccessVisible, setModalSuccessVisible] = useState(false);
  const [modalSuccessMessage, setModalSuccessMessage] = useState('');
  // console.log(formData.image_data);


  const handleInputChange = (field: string, value: string) => {
    if ((field === 'first_name' || field === 'last_name') && value.length > 30) {
      showErrorModal('El nombre y apellido no deben exceder los 30 caracteres.')
    return;
  }
  if ((field === 'city' || field === 'address' ) && value.length > 50) {
    showErrorModal('La ciudad no debe exceder los 50 caracteres.')
  return;
} 
if ((field === 'address' ) && value.length > 50) {
  showErrorModal('La dirección no debe exceder los 50 caracteres.')
return;
} 
  if ((field === 'business_type') && value.length > 25) {
    showErrorModal('El tipo de negocio no debe exceder los 30 caracteres.')
  return;
}
if ((field === 'business_type' || field === 'contact_info') && value.length > 25) {
  showErrorModal('La informacion de contacto no debe exceder los 30 caracteres.')
return;
}
    setFormData({
      ...formData,
      [field]: value,
    });
  };
  useEffect(() => {
    if (formData.birth_date) {
      const [year, month, day] = formData.birth_date.split('-');
      setSelectedDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
    }
  }, [formData.birth_date]);
  const formatDateToYYYYMMDD = (dateString: string): string => {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const formattedDate = formatDateToYYYYMMDD(
        `${selectedDate.getDate()}-${selectedDate.getMonth() + 1}-${selectedDate.getFullYear()}`
      );
      handleInputChange('birth_date', formattedDate);
    }
  };

  const confirmDate = () => {
    if (selectedDate) {
      const formattedDate = formatDateToYYYYMMDD(
        `${selectedDate.getDate()}-${selectedDate.getMonth() + 1}-${selectedDate.getFullYear()}`
      );
      handleInputChange('birth_date', formattedDate);
    }
    setShowDatePicker(false);
  };

  // const handleImagePick = async () => {
  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [1, 1],
  //     quality: 1,
  //   });

  //   if (!result.canceled) {
  //     handleInputChange('image_url', result.assets[0].uri);
  //   }
  // };
  const handleImageCompressed = (uri: string) => {
    // console.log("imagencomprimida");

    handleInputChange('image_data', uri);
  };

  const handleUpdate = async () => {
    if ((formData.first_name === '' || formData.last_name === '')) {
      showErrorModal('El nombre y apellido son de caracter obligatorio.')
    return;
  }
  setIsLoading(true)
    try {
      const { user_id, image_data, ...dataToSend } = formData;

      const validatedImageData = image_data && image_data.startsWith('http') ? null : image_data;
      // console.log("validacion de la imagen", validatedImageData);
      
      const updatedDataToSend = { ...dataToSend, image_data: validatedImageData };
      console.log("data a enviar",updatedDataToSend);
      
      const response = await dispatch<any>(updateUserAction({ ...updatedDataToSend, user_id }));
      // console.log("resouesta de la actualizacion del usuario", response);
      // console.log("resouesta de la actualizacion del usuario ver status", response.status);
      if (response.status == 200) {
        const categoriesResponse = await
          updateTourist(user_id, {
            origin: formData.country,
            birthday: formData.birth_date,
            gender: formData.gender,
            category_ids: selectedCategories,
          })
        // console.log("categoriesResponse",categoriesResponse);
        // console.log("categoriesResponse ver status",categoriesResponse.status);
        if (categoriesResponse.status == 200) {
          // dispatch(fetchUserCategories())
          showSuccessModal('Datos actualizados con éxito');
        } else {
          showErrorModal('Error al actualizar las categorías');
         
        }
      } else {
        showErrorModal('Error al actualizar los datos');
       
      }
    } catch (error) {
      showErrorModal('Error al actualizar los datos');
     
    } finally {
      setIsEditable(false);
      setIsLoading(false)
    }
  };

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategories((prevState: any) => {
      if (prevState.includes(categoryId)) {
        return prevState.filter((id: any) => id !== categoryId);
      } else {
        return [...prevState, categoryId];
      }
    });
  };
  const handleCountryChange = (value: string) => {
    handleInputChange('country', value);
  };
  const handleSaveCategories = () => {
    setCategoriesModalVisible(false);
  };
  const showErrorModal = (message: string) => {
    setModaErrorlMessage(message);
    setModalErrorVisible(true);
  };
  const showSuccessModal = (message: string) => {
    setModalSuccessMessage(message);
    setModalSuccessVisible(true);
  };
  const cancelEdit = () => {
    setIsEditable(false)
  };
  
  return (
      <ScrollView contentContainerStyle={styles.container}>
        {isLoading && <Loader/>}
       <ErrorModal
        visible={modalErrorVisible}
        message={modalErrorMessage}
        onClose={() => setModalErrorVisible(false)}
      />
      <ExitoModal
        visible={modalSuccessVisible}
        message={modalSuccessMessage}
        onClose={() => {setModalSuccessVisible(false)}}
        />
        <SemicirclesOverlay/>
        <ImageCompressor onImageCompressed={handleImageCompressed} initialImageUri={formData.image_data || undefined} isButtonDisabled={isEditable}/>
        {isEditable?
            <TouchableOpacity
            style={styles.editButton}
            onPress={cancelEdit}
          >
            <MaterialCommunityIcons name="cancel" size={24} color="#007a8b" />
          </TouchableOpacity>:
          <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditable(true)}
            >
              {/* <AntDesign name="edit" size={24} color="#007a8b" /> */}
              <MaterialCommunityIcons name="account-edit-outline" size={24} color="#007a8b" />
            </TouchableOpacity>}
        {isEditable? <>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={formData.first_name}
          onChangeText={(value) => handleInputChange('first_name', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Apellido"
          value={formData.last_name}
          onChangeText={(value) => handleInputChange('last_name', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
          editable={false}
        />
        <View style={styles.inputSelect}>
          <CountryPicker
            selectedCountry={formData.country}
            onCountryChange={handleCountryChange}
            estilo={false}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Ciudad"
          value={formData.city}
          onChangeText={(value) => handleInputChange('city', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Número de Teléfono"
          value={formData.phone_number}
          onChangeText={(value) => handleInputChange('phone_number', value)}
        />
        <View style={styles.datePickerContainer}>
          {!showDatePicker && (<TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputdate}>
            <Text style={styles.textDate}>
              {formData.birth_date ? formatDateToDDMMYYYY(formData.birth_date) : 'Fecha de Nacimiento (DD-MM-YYYY)'}
            </Text>
          </TouchableOpacity>)}
          {showDatePicker && (
            <View >
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity onPress={confirmDate} style={styles.confirmButton}>
                  <Text style={styles.confirmButtonText}>Confirmar fecha</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        {Platform.OS === 'web' ? (
          <View style={styles.selectView}>
            <select
              style={styles.select}
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
            >
              <option value="" disabled>Seleccione Género</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </View>
        ) : (
          <View >
            <RNPickerSelect
              onValueChange={(value: any) => handleInputChange('gender', value)}
              value={formData.gender}
              items={[
                { label: 'Masculino', value: 'Masculino' },
                { label: 'Femenino', value: 'Femenino' },
                { label: 'Otro', value: 'Otro' },
              ]}
              placeholder={{ label: 'Seleccione Género', value: '' }}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
            />
          </View>

        )}</>:
        (
          <View>
            <View style={styles.textform}>
              <Text style={styles.textName}>Nombre:</Text>
            <Text style={styles.textValue}>{formData.first_name}</Text>
            </View>
            <View style={styles.textform}>
            <Text style={styles.textName}>Apellido:</Text>
            <Text style={styles.textValue}>{formData.last_name || 'No especificado'}</Text>
            </View>
  
            <View style={styles.textform}>
              <Text style={styles.textName}>Correo Electrónico:</Text>
              <Text style={styles.textValue}>{formData.email || 'No especificado'}</Text>
            </View>
            
            <View style={styles.textform}>
              <Text style={styles.textName}>País:</Text>
              <Text style={styles.textValue}>{formData.country || 'No seleccionado'}</Text>
            </View>
            
            <View style={styles.textform}>
              <Text style={styles.textName}>Ciudad:</Text>
              <Text style={styles.textValue}>{formData.city || 'No especificado'}</Text>
            </View>
            
            <View style={styles.textform}>
              <Text style={styles.textName}>Número de Teléfono:</Text>
              <Text style={styles.textValue}>{formData.phone_number || 'No especificado'}</Text>
            </View>
            
            <View style={styles.textform}>
              <Text style={styles.textName}>Fecha de Nacimiento:</Text>
              <Text style={styles.textValue}>
                {formData.birth_date ? formatDateToDDMMYYYY(formData.birth_date) : 'No especificada'}
              </Text>
            </View>
            
            <View style={styles.textform}>
              <Text style={styles.textName}>Género:</Text>
              <Text style={styles.textValue}>{formData.gender? formData.gender : 'No especificado'}</Text>
            </View>
          </View>
        )}
        {isEditable && <> 
        <TouchableOpacity
          style={styles.button}
          onPress={() => setCategoriesModalVisible(true)}
        ><MaterialIcons name="category" size={24} color="white" />
          <Text style={styles.buttonText}>Ver Categorías</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSub} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Actualizar datos</Text>
        </TouchableOpacity>
        </>}
        <Modal visible={isCategoriesModalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Categorías</Text>
              <ScrollView>
                {allCategories.map((category) => (
                  <View key={category.category_id} style={styles.checkboxContainer}>
                    <Checkbox
                      value={selectedCategories.includes(category.category_id)}
                      onValueChange={() => handleCategoryChange(category.category_id)}
                    />
                    <Text style={styles.label}>{category.name}</Text>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={handleSaveCategories} style={styles.modalButton}>
                {isEditable&&<Text style={styles.modalButtonText}>Guardar Categorías</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCategoriesModalVisible(false)} style={styles.modalButtonCancel}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    // </LinearGradient>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    minHeight: 48,
    width: Platform.OS === 'web' ? '50%' : screenWidth,
    maxWidth: Platform.OS === 'web' ? 400 : screenWidth * 0.8,
    borderColor: 'rgba(0, 122, 140,0.5)',
    borderWidth: 1,
    borderRadius: 7,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    alignSelf: 'center',
  },
  inputAndroid: {
    minHeight: 48,
    width: Platform.OS === 'web' ? '50%' : screenWidth,
    maxWidth: Platform.OS === 'web' ? '30%' : screenWidth * 0.8,
    borderColor: 'rgba(0, 122, 140,0.5)',
    borderWidth: 1,
    borderRadius: 7,
    marginBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    alignSelf: 'center',
  },
});

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    paddingBottom:50
    // backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#007a8c',
  },
  textform:{
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    width:'100%',
    // justifyContent:'space-between',
    textAlign:'left'
  },
  textName:{
    fontSize: 14,
    color: 'rgba(0, 122, 140,0.8)',
    minWidth:'30%',
    maxWidth:'30%'
  },
  textValue: {
    maxWidth:'70%',
    fontSize: 16,
    marginVertical: 5,
    padding: 5,
    color: 'rgba(0, 122, 140,1)',
    fontWeight:'700'
  },
  editButton:{
    position:'absolute',
    alignContent:'center',
    alignItems:'center',
    justifyContent:'center',
    borderRadius:25,
    backgroundColor:'rgb(232, 232, 232)',
    top:110,
    right:120,
    height:37,
    width:37,
    borderColor: 'rgba(0, 122, 140,0.2)',
    borderWidth: 1,
  },
  inputSelect: {
    height: 48,
    width: '90%',
    borderColor: 'rgba(0, 122, 140,0.5)',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    display: 'flex',
    justifyContent: 'center',
    minHeight:48,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  input: {
    height: 35,
    width: '90%',
    borderColor: 'rgba(0, 122, 140,0.5)',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    minHeight:48
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    alignSelf: 'center',
    borderColor: '#007a8c',
    borderWidth: 1,
    zIndex:1

  },
  button: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: '#007a8c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 10,
    alignItems: 'center',
    width: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
    minHeight:48,
  },
  buttonSub: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: '#007a8c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 10,
    alignItems: 'center',
    width: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
    minHeight:48,
    marginBottom:50
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectView: {
    width: screenWidth,
    borderColor: 'rgba(0, 122, 140,0.5)',
    borderWidth: 1,
    borderRadius: 8,
  },
  select: {
    height: 48,
    width: screenWidth,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    // outLineColor: 'rgba(49, 121, 187,0.5)',
    // borderColor: 'rgba(0, 122, 140,0.5)',
    fontSize: 16,
    color: '#595959',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
    alignContent: 'center'
  },
  modalText: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  label: {
    marginLeft: 8,
  },
  modalButton: {
    backgroundColor: '#007a8c',
    borderRadius: 25,
    padding: 10,
    alignItems: 'center',
    marginVertical: 10,
    minHeight:48,
    justifyContent:'center'
  },
  modalButtonCancel: {
    backgroundColor: '#F1AD3E',
    borderRadius: 25,
    padding: 10,
    alignItems: 'center',
    marginVertical: 5,
    minHeight:48,
    justifyContent:'center'
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalError: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
    // backgroundColor: '#f8d7da',
  },
  modalSuccess: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
    // backgroundColor: '#d4edda',
  },
  datePickerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
  },
  textDate: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center'
  },
  inputdate: {
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    minHeight: 48,
    width: '90%',
    borderColor: 'rgba(0, 122, 140,0.5)',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,

  },
  confirmButton: {
    backgroundColor: '#007a8c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 10,
    width: 250,
    alignSelf: 'center'
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 16,
    marginVertical: 5,
  },
});

export default ProfileScreen;