export interface SignInPayload{
    email:string,
    password:string
}

export interface SignUpPayload{
    email:string,
    password:string,
    name:string,
    surname:string,
    birthDate:string,
    gender:string,
    group:string,
    user:string
    image?: {
        url: string;
        large: string;
        medium: string;
        small: string;
        thumbnail: string;
    };
}

export interface User{
    id:string,
    username:string,
    email:string,
    image?: {
        url: string;
        large: string;
        medium: string;
        small: string;
        thumbnail: string;
    };
}