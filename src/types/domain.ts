
export interface IUserLoginPayload {
  email: string;
  password: string;
}

export interface IRequest {
  body: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  };
}

export interface IMessage {
  message: string;
}

export interface IUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_name: string;
  password: string;
  is_admin: boolean;
  address?: string;
  country?: string;
  avatar?: any;
  about_me?: string;
  education?: string;
  experiences?: string;
  interests?: string;
  inserted_at: string;
  updated_at: string;
}