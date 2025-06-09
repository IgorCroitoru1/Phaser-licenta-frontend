export type SignInData = {
    email: string
    password: string
  }
  
  export type SignUpData = {
    fullName: string
    email: string
    password: string
    verificationCode: string
  }
  
  export type Credentials = {
    access_token: string
  }