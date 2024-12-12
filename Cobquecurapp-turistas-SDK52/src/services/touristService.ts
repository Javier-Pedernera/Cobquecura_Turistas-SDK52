import axios from 'axios';
import { setUserCategories } from '../redux/reducers/categoryReducer';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const createTourist = async (touristData: {
  user_id: number;
  origin: string | null;
  birthday: string | null;
  gender: string | null;
  category_ids: number[];
}) => {
  try {
    // Paso 1: Crear el perfil de turista
    const response = await axios.post(`${API_URL}/tourists`, touristData);
    // console.log("Perfil de turista creado", response);

    // Paso 2: Obtener los roles disponibles
    const rolesResponse = await axios.get(`${API_URL}/roles`);
    const roles = rolesResponse.data;

    // Buscar el rol "tourist" (comparación case-insensitive)
    const touristRole = roles.find((role: any) =>
      role.role_name.toLowerCase() === 'tourist'
    );
    // console.log("rol de turista", touristRole);
    
    if (!touristRole) {
      throw new Error('No se encontró el rol de turista');
    }
    // Paso 3: Asignar el rol de "tourist" al usuario creado
    const roleAssignmentData = {
      role_ids: [touristRole.role_id], 
      user_id: touristData.user_id 
    };

    const roleAssignResponse = await axios.post(`${API_URL}/assign_roles_to_user`, roleAssignmentData);
    // console.log("Rol de turista asignado correctamente", roleAssignResponse);

    if (roleAssignResponse.status !== 201) {
      throw new Error('No se pudo asignar el rol de turista');
    }

    return response;
  } catch (error:any) {
    console.error("Error al crear turista o asignar rol", error);
    throw new Error(error.response?.data?.message || 'Creation of tourist profile or role assignment failed');
  }
};


export const updateTourist = async (user_id: number, touristData: {
  origin: string | null;
  birthday: string | null;
  gender: string | null;
  category_ids: number[];
}) => {
  try {
    const response = await axios.put(`${API_URL}/tourists/${user_id}`, touristData);
    // console.log("Respuesta de actualización de turista", response);
    return response;
  } catch (error) {
    throw new Error('Actualización del perfil de turista fallida');
  }
};
