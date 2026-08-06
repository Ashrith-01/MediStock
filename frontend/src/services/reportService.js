import api from "../api/axiosInstance";

export const downloadInventoryReport = () => {
  return api.get("/reports/inventory/pdf", {
    responseType: "blob",
  });
};

export const downloadExpiryReport = () => {
  return api.get("/reports/expiry/pdf", {
    responseType: "blob",
  });
};

export const downloadStockReport = () => {
  return api.get("/reports/stock/pdf", {
    responseType: "blob",
  });
};