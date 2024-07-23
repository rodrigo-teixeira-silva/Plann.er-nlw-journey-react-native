import axios, { Axios } from "axios";

export const api = axios.create({
  baseURL: "http://192.168.100.31:3333",
})

// documentação da api nlw-journey.api.documentation.com