import axios from "axios"

const axiosBare = axios.create({
    baseURL: process.env.NEXT_PUBLIC_AUTH_SERVER_URL,
    withCredentials: true,
  })

export default axiosBare