import axios from "axios";
import { LoginResponse, UserData, UserDataCreate } from "../redux/types/types";
import { clearUserData } from "../utils/storage";
import { logOut } from "../redux/reducers/userReducer";
import { Dispatch } from "@reduxjs/toolkit";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

  
export const loginUserAuth = async (email: string, password: string): Promise<LoginResponse | { error: string }> => {
  try {
    // console.log(`${API_URL}/login`)
    const response = await axios.post<LoginResponse>(`${API_URL}/login`, { email, password });
    const user = response.data.user;
    // Validación del estado del usuario
      // console.log(response);
      
    if (typeof user.status === 'object' && user.status !== null && 'name' in user.status) {
      if (user.status.name !== 'active') {
        return { error: 'Asociado inactivo' };
      }
    }

    // Validación del rol del usuario
    const hasAssociatedRole = response.data.user.roles?.some((role: { role_name: string }) => role.role_name === 'tourist');
    if (!hasAssociatedRole) {
      return { error: 'Rol no autorizado' };
    }

    return response.data;
  } catch (error:any) {
    console.log(error)
    if (error.response && error.response.data && error.response.data.message) {
      return { error: error.response.data.message }; 
    }
    return { error: 'Se produjo un error. Intente nuevamente mas tarde.' };
  }
};
  
export const registerUser = async (userData: UserDataCreate) => {
  try {
    // console.log("datos del formulario en el registro",userData);
    // console.log(API_URL);
    
    const response = await axios.post(`${API_URL}/signup`, userData);
    // console.log("respuesta del registro",response);
    
    if(response.status === 201 ){
      // console.log("____usuario creado__________");
    }
    return response;
  } catch (error) {
    throw new Error('Registration failed');
  }
};

export const logoutUser = () => {
  return async (dispatch: Dispatch) => {
    try {
      await clearUserData();
      dispatch(logOut());
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
};

export const sendPasswordResetEmail = async (email: string) => {
  try {
    // console.log("envio email para recuperar contraseña", email);
    
    const response = await axios.post(`${API_URL}/reset_password`, { email });
    // console.log(response.data);
    return response.data;
  } catch (error) {
    throw new Error('Error al enviar el correo de recuperación.');
  }
};

// Función para restablecer la contraseña
export const resetPassword = async (token: string, newPassword: string) => {
  console.log("envio contraseña para cambiar");

  // const response = await axios.post(`${API_URL}/auth/reset-password/${token}`, { password: newPassword });
  // return response.data;
};

