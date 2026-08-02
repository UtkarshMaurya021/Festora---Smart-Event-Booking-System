import api from "./api";

export const getUserProfile = () => {
  return api.get("/user/profile");
};
