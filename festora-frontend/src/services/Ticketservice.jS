import api from "./api";

export const getTickets = () => {
  return api.get("/tickets/my");
};