import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Image, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { userLogIn } from '../redux/actions/userActions';
import Loader from '../components/Loader';
import { RootStackParamList } from '../navigation/AppNavigator';
import { fetchAllCategories } from '../redux/actions/categoryActions';
import { AppDispatch } from '../redux/store/store';
import { Dimensions } from 'react-native';
import Constants from 'expo-constants'; 
import ErrorModal from '../components/ErrorModal';
import ExitoModal from '../components/ExitoModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
type LoginScreenProp = StackNavigationProp<RootStackParamList, 'Login'>;
const appVersion = Constants.expoConfig?.version;

const LoginScreen: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigation = useNavigation<LoginScreenProp>();
  const route = useRoute<any>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const promotionId = route.params?.promotionId;
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [modalSuccessMessage, setModalSuccessMessage] = useState('');
  
  // console.log("ruta del login",route);
  // console.log("id de la promocion",promotionId);
  // console.log("terminos actuales",currentTerms);
  const isEmailValid = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  const handleLogin = async () => {
    const lowerCaseEmail = email.trim().toLowerCase();
    if (lowerCaseEmail === '') {
          showErrorModal('Por favor ingresa tu correo electrónico.');
          return;
        }
        if (password === '') {
          showErrorModal('Por favor ingresa tu contraseña.');
          return;
        }    
    if (!isEmailValid(lowerCaseEmail)) {
      showErrorModal('El correo ingresado no es válido.');
      return;
    }
    try {
      setLoading(true);
      const response = await dispatch<any>(userLogIn(lowerCaseEmail, password));
      
      setError(null);
      setEmail('')
      setPassword('')
      if (promotionId) {
        navigation.navigate('PromotionDetail', { promotionId });
      } else {
        navigation.navigate('MainAppScreen');
      }
    } catch (err: any) {
      
      setError(err.message);
      showErrorModal(err.message);
      toggleModal();
    } finally {
      setLoading(false);
    }
  }
  const showErrorModal = (message: string) => {
    setModalErrorMessage(message);
    setErrorModalVisible(true);
  };

  return (
    <LinearGradient
      colors={['#007a8c', '#f6f6f6']}
      style={styles.container}
    >
      <View style={styles.card}>
        <Image source={require('../../assets/logo.png')} style={styles.logoLog} />
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Contraseña"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#acd0d5" />
          </TouchableOpacity>
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
        <TouchableOpacity style={styles.forgotPasswordButton} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPasswordText}>Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>
        <Text style={styles.TextNot}>No tienes cuenta?</Text>
      </View>
      <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.buttonSecondaryText}>Regístrate</Text>
      </TouchableOpacity>
      <Text  style={styles.versionText} >Version {appVersion}</Text>
       {/* Modales */}
       <ErrorModal
        visible={errorModalVisible}
        message={modalErrorMessage}
        onClose={() => setErrorModalVisible(false)}
      />
      <ExitoModal
        visible={successModalVisible}
        message={modalSuccessMessage}
        onClose={() => setSuccessModalVisible(false)}
      />
        {loading && <Loader />}
        
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#f6f6f6',
    padding: 20,
    borderRadius: 25,
    width: '90%',
    alignItems: 'center',

    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  logoLog: {
    height: 130,
    width: 130,
    marginBottom: 30,
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'rgb(172, 208, 213)',
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: screenWidth*0.04,
    minHeight:48,
    alignItems:'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    width: '100%',
    borderColor: 'rgb(172, 208, 213)',
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 0,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    minHeight:48,
  },
  inputPassword: {
    flex: 1,
    fontSize: screenWidth*0.04
  },
  error: {
    color: '#007a8c',
    marginBottom: 15,
    
  },
  button: {
    backgroundColor: '#007a8c',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 0,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    fontFamily: Platform.OS == 'ios'? 'Inter-Bold': 'Inter-Regular-400',
    // Sombra en el botón
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
    minHeight:48,
    alignContent:'center',
    justifyContent:'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: screenWidth*0.04,
    fontWeight: '700',
    fontFamily: Platform.OS == 'ios'? 'Inter-Bold': 'Inter-Regular-400',
  },
  buttonSecondary: {
    backgroundColor: '#f6f6f6',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
    width: '90%',
    minHeight:48,
    alignItems:'center',
    alignContent:'center',
    justifyContent:'center'
  },
  buttonSecondaryText: {
    color: '#007a8c',
    fontSize: screenWidth*0.04,
    fontWeight: '700',
    fontFamily: Platform.OS == 'ios'? 'Inter-Bold': 'Inter-Regular-400',
  },
  forgotPasswordButton: {
    // backgroundColor:'red',
    minHeight:48,
    paddingTop: 10,
    width: '95%',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    alignItems: 'flex-end'
  },
  forgotPasswordText: {
    color: '#007a8c',
    fontSize: screenWidth*0.03,
    fontFamily: Platform.OS == 'ios'? 'Inter-Bold': 'Inter-Regular-400',
    fontWeight: '700',
  },
  TextNot:{
    color: '#007a8c',
    fontSize: screenWidth*0.03,
    fontFamily: 'Inter-Regular-400',
  },
  modalContent: {
    backgroundColor: 'rgba(246, 246, 246, 0.9)',
    color: 'white',
    display:'flex',
    alignSelf:'center',
    flexDirection:'column',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '70%',
    height:'30%',
    justifyContent:'space-evenly'
  },
  versionText:{
    marginTop:20,
    fontSize: screenWidth*0.035,
    fontFamily: 'Inter-Regular-400',
    color: '#007a8c',
    fontWeight:'400'
  }
});

export default LoginScreen;
