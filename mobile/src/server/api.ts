import axios from "axios"

export const api = axios.create({
  baseURL: "http://192.168.100.31:3333", // subistitua o IP pelo da sua máquina local
})
