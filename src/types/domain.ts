
export interface IUserLoginPayload {
  email: string;
  password: string;
}

export interface IRequest {
  body: {
    name: string;
    lastname: string;
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
  last_name: string;
  username: string;
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