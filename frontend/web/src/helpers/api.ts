import axios from "axios";

export function signin(email: string, password: string) {
  return axios.post<User>("/api/v1/auth/signin", {
    email,
    password,
  });
}

export function signup(email: string, nickname: string, password: string) {
  return axios.post<User>("/api/v1/auth/signup", {
    email,
    nickname,
    password,
  });
}

export function signout() {
  return axios.post("/api/v1/auth/logout");
}
