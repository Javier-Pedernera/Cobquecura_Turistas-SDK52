export enum UserActionTypes {
    LOGIN_SUCCESS = 'LOGIN_SUCCESS',
    LOGIN_FAILURE = 'LOGIN_FAILURE',
    REGISTER_SUCCESS = 'REGISTER_SUCCESS',
    REGISTER_FAILURE = 'REGISTER_FAILURE',
  }
  
  // Definición del tipo de estado del usuario
  export interface UserState {
    userData: UserData | {}; 
    loading: boolean; 
    error: string | null; 
  }
  export interface Category {
    category_id: number;
    name: string;
  }
  export interface UserCategory {
    id?: number;
    category_id?: number;
    name: string;
  }
  export interface Status {
    id: number;
    name: string;
    description: string | null;
  }
  export interface Functionality {
    id: number;
    name: string;
    description: string;
    platform: string;
  }
   //Roles
   export interface Role {
    role_id: number;
    role_name: string;
    functionalities: Functionality[];
  }
  //terminos
  export interface Terms {
    content: string;
    created_at: string;
    id: number;
    version: string;
  };
  // Definición de la estructura de los datos del usuario
    export interface UserData {
      user_id?: number;
      public_id?: string;
      password?: string;
      roles?: Role[];
      first_name: string;
      last_name: string;
      country: string;
      city: string;
      birth_date?: string;
      email: string;
      phone_number?: string;
      gender?: string;
      status?: Status | number;
      subscribed_to_newsletter?: boolean;
      image_url?: string | null;
      categories?: number[];
      terms?: Terms | null;
      terms_accepted_at?: string; 
    }

    
    export interface UserDataCreate {
      user_id?: number;
      public_id?: string;
      password?: string;
      roles?: Role[];
      first_name: string;
      last_name: string;
      country: string;
      city: string;
      birth_date?: string;
      email: string;
      phone_number?: string;
      gender?: string;
      status?: Status | number;
      subscribed_to_newsletter?: boolean;
      image_url?: string | null;
      categories?: number[];
      accept_terms: boolean
    }
  export interface LoginResponse {
    token: string;
    user: UserData;
  }
  export interface ImagePromotion {
    image_id: number;
    image_path: string;
    promotion_id: number;
  }
  export interface Promotion {
    promotion_id: number;
    title: string;
    description: string;
    start_date: string;
    expiration_date: string;
    qr_code: string;
    partner_id: number;
    categories: Category[];
    images: ImagePromotion[];
    latitude?: number;
    longitude?: number;
    discount_percentage?:number;
    branch_id?:number;
    available_quantity?: number;
    branch_name?:string;
    partner_details?:any;
  }

  export interface Branch {
    branch_id: number;
    partner_id: number;
    name: string;
    description: string;
    address: string;
    latitude: number;
    longitude: number;
    status: Status;
    image_url: string;
  }
  export interface Favorite{
    created_at: string;
    promotion_id: number;
    user_id: number
  }

  export interface TouristPoint {
    id: number;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    images: {
      id: number;
      image_path: string;
    }[];
    average_rating: number | null;
    status?:Status
  }
  export interface Rating {
    id: number ;
    comment: string;
    rating: number;
    tourist_id?: number;
    tourist_point_id: number;
    tourist_first_name?:string;
    tourist_image_url?:string;
  }
  export interface NewRating {
    comment: string;
    rating: number;
    tourist_id?: number;
  }
  export interface putRating {
    comment: string;
    rating: number;
  }
  export interface RatingBranch {
    id?: number ;
    user_id?:number;
    rating: number ;
    comment: string ;
    created_at?: string;
    first_name?:string;
  }
  export interface Country {
    code: string;      
    id: number; 
    name: string;
    phone_code: string;
  }