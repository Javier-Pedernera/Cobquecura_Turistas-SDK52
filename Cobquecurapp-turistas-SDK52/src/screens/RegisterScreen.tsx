import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { registerUser } from '../services/authService';
import Ionicons from '@expo/vector-icons/Ionicons';
import Checkbox from 'expo-checkbox';
import Modal from 'react-native-modal';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllCategories } from '../redux/actions/categoryActions';
import { AppDispatch } from '../redux/store/store';
import { createTourist } from '../services/touristService';
import Loader from '../components/Loader';
import { formatDateToYYYYMMDD } from '../utils/formatDate';
import { getMemoizedAllCategories } from '../redux/selectors/categorySelectors';
import CountryPicker from '../components/CountrySelect';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Dimensions } from 'react-native';
import TermsModal from '../components/TermsModal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ErrorModal from '../components/ErrorModal';
import ExitoModal from '../components/ExitoModal';
import CustomDatePicker from '../components/CustomDatePicker';
import GenderSelect from '../components/GenderSelect';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
type RegisterScreenProp = StackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigation = useNavigation<RegisterScreenProp>();
  const categories = useSelector(getMemoizedAllCategories);


  useEffect(() => {
    dispatch(fetchAllCategories());
    fetchTerms();
  }, [dispatch]);


  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    country: '',
    city: '',
    phone_number: '',
    gender: '',
    other_gender: '',
    birth_date: '',
    password: '',
    confirmPassword: '',
    subscribed_to_newsletter: false,
    status_id: 1,
    accept_terms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
  const [termsText, setTermsText] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [modalErrorMessage, setModaErrorlMessage] = useState('');
  const [modalSuccessVisible, setModalSuccessVisible] = useState(false);
  const [modalSuccessMessage, setModalSuccessMessage] = useState('');
  // console.log("terminos aceptados?",isTermsAccepted);
  console.log("datos en el formulario",formData);
  
  const fetchTerms = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/terms`);
      if (!response.ok) {
        throw new Error('Error al obtener los términos y condiciones');
      }
      const data = await response.json();
        setTermsText(data.content);
    } catch (error:any) {
      setError(error.message);
    }
  };
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    if (field === 'email') {
      value = value.toLowerCase();
      if (value.length > 30) {
        showErrorModal('El correo no debe exceder los 50 caracteres.');
        return;
      }
    }
    if (field === 'password') {
      validatePassword(value);
    }
    if ((field === 'first_name' || field === 'last_name') && value.length > 30) {
      showErrorModal('No debe exceder los 30 caracteres.')
    return;
  }
  if ((field === 'city' ) && value.length > 50) {
    showErrorModal('No debe exceder los 50 caracteres.')
  return;
} 
 
    setFormData({
      ...formData,
      [field]: value,
    });
  };
  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategories(prevSelectedCategories => {
      if (prevSelectedCategories.includes(categoryId)) {
        return prevSelectedCategories.filter(id => id !== categoryId);
      } else {
        return [...prevSelectedCategories, categoryId];
      }
    });
  };
  // console.log("categorias",formData);
  // console.log(selectedCategories);

  const handleRegister = async () => {
    if (formData.phone_number) {
      const phoneRegex = /^[+]?[0-9]{7,15}$/;
      if (!phoneRegex.test(formData.phone_number)) {
          showErrorModal('Número de teléfono no válido. Debe contener entre 7 y 15 dígitos.');
          return;
      }
  }
  if (!validateEmail(formData.email)) {
    showErrorModal('Por favor, ingresa un correo electrónico válido.');
    return;
  }
    setLoading(true);

    if (!isPasswordValid) {
      setError('La contraseña no cumple con los requisitos de seguridad.');
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!isTermsAccepted) {
      setError('Debes aceptar los términos y condiciones');
      setLoading(false);
      return;
  }
    const { confirmPassword, other_gender, ...dataToSend } = formData;
    if (other_gender) {
      dataToSend.gender = other_gender;
    }
    dataToSend.accept_terms = isTermsAccepted;
    console.log("data a enviar",dataToSend);
    
    try {
      // Registro del usuario
      const userResponse = await registerUser(dataToSend);
      // console.log("userResponse", userResponse);

      if (userResponse.status === 201) {
        const { user_id, country, gender, birth_date } = userResponse.data;
        // Crear turista
        const touristData = {
          user_id: user_id,
          origin: country || null,
          birthday: birth_date || null,
          gender: gender || null,
          category_ids: selectedCategories,
        };

        const touristResponse = await createTourist(touristData);
        // console.log("touristResponse",touristResponse);
        if (touristResponse.status === 200) {
          setError(null);
          showSuccessModal( "Usuario registrado correctamente");
          setFormData({
            first_name: '',
            last_name: '',
            email: '',
            country: '',
            city: '',
            phone_number: '',
            gender: '',
            other_gender: '',
            birth_date: '',
            password: '',
            confirmPassword: '',
            subscribed_to_newsletter: false,
            status_id: 1,
            accept_terms: false
          })
          setTimeout(() => {
            navigation.navigate('Login',{});
          }, 2000);
        } else {
          setError('Fallo al crear el perfil de turista');
        }
      } else {
        setError('Fallo en el registro');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
 
  const handleCountryChange = (value: string) => {
    handleInputChange('country', value);
  };
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const isFormValid = () => {
    return (
      formData.first_name &&
      formData.last_name &&
      formData.email &&
      formData.country &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      isPasswordValid
    );
  };
  const toggleTermsModal = () => {
    setIsTermsModalVisible(!isTermsModalVisible);
  };

  const acceptTerms = () => {
    setIsTermsAccepted(!isTermsAccepted);
    toggleTermsModal();
  };

  const validatePassword = (password: string) => {
    const newErrors = [];
    if (password.length < 8) newErrors.push('La contraseña debe tener al menos 8 caracteres.');
    if (!/[A-Z]/.test(password)) newErrors.push('Debe incluir al menos una letra mayúscula.');
    if (!/[0-9]/.test(password)) newErrors.push('Debe incluir al menos un número.');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) newErrors.push('Debe incluir al menos un carácter especial.');
    setPasswordErrors(newErrors);
    setIsPasswordValid(newErrors.length === 0);
  };


  const handleBirthDateChange = (date: Date) => {
    const formattedDate = formatDateToYYYYMMDD(
      `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
    );
    setSelectedDate(date);
    handleInputChange('birth_date', formattedDate);
  };

  const showErrorModal = (message: string) => {
    setModaErrorlMessage(message);
    setModalErrorVisible(true);
  };
  const showSuccessModal = (message: string) => {
    setModalSuccessMessage(message);
    setModalSuccessVisible(true);
  };
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.maincontainer}>
      <LinearGradient
      colors={['#007a8c', '#f6f6f6']}
      style={styles.container}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={styles.containerScroll}
        enableOnAndroid={true}
        extraHeight={Platform.OS === 'ios' ? 100 : 200}
        keyboardOpeningTime={0}
      >
      {loading && <Loader />}
      <ScrollView contentContainerStyle={styles.containerScroll}>
        {/* <View style={styles.formGrid}> */}
        <Text style={styles.titleRegister}>Registro de turista</Text>
          <TextInput
            style={styles.input}
            placeholder="* Nombre"
            placeholderTextColor="#aaa"
            value={formData.first_name}
            onChangeText={(value) => handleInputChange('first_name', value)}
          />
          <TextInput
            style={styles.input}
            placeholder="* Apellido"
            placeholderTextColor="#aaa"
            value={formData.last_name}
            onChangeText={(value) => handleInputChange('last_name', value)}
          />
          <TextInput
            style={styles.input}
            placeholder="* Correo electrónico"
            placeholderTextColor="#aaa"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
          />
          <CountryPicker
            selectedCountry={formData.country}
            onCountryChange={handleCountryChange}
            estilo={true}
          />
          <TextInput
            style={styles.input}
            placeholder="Ciudad"
            placeholderTextColor="#aaa"
            value={formData.city}
            onChangeText={(value) => handleInputChange('city', value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Número de teléfono"
            placeholderTextColor="#aaa"
            value={formData.phone_number}
            onChangeText={(value) => handleInputChange('phone_number', value)}
            keyboardType="phone-pad"
          />
          <CustomDatePicker
            selectedDate={selectedDate}
            onDateChange={handleBirthDateChange}
            placeholder="Fecha de Nacimiento"
          />
          <View style={styles.genderDivider}>
            <GenderSelect
              selectedGender={formData.gender}
              otherGender={formData.other_gender}
              onGenderChange={(value) => handleInputChange('gender', value)}
              onOtherGenderChange={(value) => handleInputChange('other_gender', value)}
            />
          </View>
          
          
          <TouchableOpacity style={styles.buttonModal} onPress={toggleModal}>
          <MaterialIcons name="format-list-bulleted-add" size={22} color="#fff" />
            {/* <Ionicons name="add" size={24} color="#fff" style={styles.buttonModalIcon} /> */}
            <Text style={styles.buttonModalText}>Preferencias</Text>
          </TouchableOpacity>
          <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
            <ScrollView style={styles.modalContent}  contentContainerStyle={{ alignItems: 'center' }} >
              <Text style={styles.modalTitle}>Selecciona tus preferencias</Text>
              <ScrollView style={{ paddingLeft: 10, width: '100%' }}>
                {categories.map((category) => (
                  <View key={category.category_id} style={styles.checkboxWrapper}>
                    <Checkbox
                      value={selectedCategories.includes(category.category_id)}
                      onValueChange={() => handleCategoryChange(category.category_id)}
                    />
                    <Text style={styles.label}>{category.name}</Text>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.modalButton} onPress={toggleModal}>
                <Text style={styles.modalButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </ScrollView>
          </Modal>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.inputPassword}
              placeholder="* Contraseña"
              placeholderTextColor="#aaa"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry={!showPassword}
            />

            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#aaa" />
            </TouchableOpacity>
          </View>

          {passwordErrors.map((error, index) => (
              <Text key={index} style={styles.error}>
                {error}
              </Text>
            ))}
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.inputPassword}
              placeholder="* Confirmar Contraseña"
              placeholderTextColor="#aaa"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#aaa" />
            </TouchableOpacity>
          </View>
        {/* </View> */}
        <View>
        <TouchableOpacity onPress={toggleTermsModal} style={styles.termsButton}>
              <Checkbox
                style={styles.checkbox}
                value={isTermsAccepted}
                onValueChange={() => setIsTermsAccepted(!isTermsAccepted)}
              />
              <Text style={styles.termsText}>Aceptar términos y condiciones</Text>
            </TouchableOpacity>
        </View>

            <TermsModal 
                isVisible={isTermsModalVisible}
                toggleModal={toggleTermsModal} 
                acceptTerms={acceptTerms} 
                termsText={termsText}
                onCancel={undefined}
                newTerms={false}
              />
          {error && <Text style={styles.error}>{error}</Text>}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, !isFormValid() && { backgroundColor: '#acd0d5' }]}
            onPress={handleRegister}
            disabled={!isFormValid()}
            >
            <Text style={styles.buttonText}>Registrar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('Login', {})}>
            <Text style={styles.buttonSecondaryText}>Volver</Text>
          </TouchableOpacity>
        </View>
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
      </ScrollView>
      </KeyboardAwareScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    height: 50,
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    fontSize: screenWidth*0.04,
    paddingHorizontal: 10,
    color:'#333',
  },
  
  inputAndroid: {
    height: 48,
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    fontSize: screenWidth*0.04,
  },
  
});

const styles = StyleSheet.create({
  maincontainer:{
    flex: 1,
  },
  container: {
    paddingTop:  Platform.select({ ios: 40, android: 30 }),
    backgroundColor: 'rgba(246, 246, 246, 0.5)',
    height:  screenHeight
  },
  titleRegister:{
  width:'100%',
  color:'#007a8c',
  textAlign:'center',
  alignSelf:'center',
  marginBottom:15,
  marginTop:  Platform.select({ ios: 20, android: 10 }),
  fontWeight:'bold',
  fontSize: Platform.select({ ios: screenHeight*0.02, android: screenHeight*0.023 }),
  },
  containerScroll:{
    flexGrow:1,
    borderRadius: 20,
    padding:10,
    backgroundColor: 'rgba(246, 246, 246, 1)',
    paddingBottom:30,
  
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007a8c',
  },
  formGrid: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    
  },
  modalPickerContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  input: {
    height: 48,
    minHeight: 48,
    width: '100%',
    borderColor: 'rgb(172, 208, 213)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: screenWidth*0.04,
    shadowColor: '#007a8c',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    marginVertical:  Platform.select({ ios: 5, android: 5 })
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    minHeight: 48,
    width: '100%',
    borderColor: 'rgb(172, 208, 213)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    
    shadowColor: '#007a8c',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    marginVertical:  Platform.select({ ios: 5, android: 5 })
  },
  inputPassword: {
    flex: 1,
    fontSize: screenWidth*0.04,

  },
  passwordDivider: {
    width: '100%',
    marginTop: 10,
  },
  genderDivider: {
    width: '100%',
    marginTop: 1,

  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign:'center'
  },
  buttonContainer: {
    height:50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    marginBottom:70
  },
  button: {
    backgroundColor: '#336749',
    paddingVertical: 7,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
    justifyContent:'center',
    height:48
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    backgroundColor: '#007a8c',
    paddingVertical: 7,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 1,
    elevation: 2,
    height: 48,
    justifyContent:'center',
  },
  buttonSecondaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    width: '90%',
  },
  checkbox: {
    borderRadius: 5,
    height:17,
    width:17,
    marginLeft: 15,
    marginRight: 10,
    // marginBottom:15,
    borderWidth:0.3,
    marginTop: 5,
  },
  checkboxLabel: {
    fontSize: 16,
    color: 'rgb(51, 103, 73)'
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  label: {
    marginLeft: 8,
  },
  modalContent: {
    flexGrow: 1,
    width:screenWidth*0.9,
    height:screenHeight*0.8,
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',

  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign:'center',
    marginBottom: 10,
    marginTop:5
  },
  modalButton: {
    backgroundColor: '#007a8c',
    padding: 10,
    borderRadius: 25,
    marginTop: 15,
    marginBottom:30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 1,
    width:'90%',

    textAlign:'center',
    justifyContent:'center',
    minHeight:48
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign:'center'
  },
  buttonModal: {
    backgroundColor: '#019db2',
    borderRadius: 25,
    padding: 5,
    height: 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 10,
    marginTop:10,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
    borderColor: 'rgb(84, 176, 206)',
    borderWidth: 0.5,
    minHeight:48
  },
  buttonModalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,

  },
  buttonModalIcon: {
    marginRight: 5,
  },
  confirmButton: {
    backgroundColor: '#019db2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
    width: 250,
    alignSelf: 'center',
    justifyContent:'center',
    minHeight:48
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',

  },
  datePickerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
    minHeight:48,
    marginBottom:5,
    marginTop:5
  },
  textDate: {
    color: 'rgb(160, 160, 160)',
    fontSize: 16,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center'
  },
  pickerWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    backgroundColor: '#fff',
    height: 48,
    alignContent: 'center',
    minHeight:48
  },
  termsButton: {
    minHeight:48,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    alignSelf:'center'
  },
  termsText: {
    marginLeft: 8,
    color: '#336749',
  },
});

export default RegisterScreen;

