import { axiosClient } from "./axiosClient";
import type { ApiResponse, Offer } from "../types";

export const offersApi = {
  create: (applicationId: string, packageLPA: number) =>
    axiosClient.post<ApiResponse<Offer>>("/offers", { applicationId, packageLPA }).then((r) => r.data),

  uploadOfferLetter: (offerId: string, file: File) => {
    const formData = new FormData();
    formData.append("offerLetter", file);
    return axiosClient
      .post<ApiResponse<Offer>>(`/offers/${offerId}/offer-letter`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  respond: (offerId: string, status: "ACCEPTED" | "DECLINED") =>
    axiosClient.patch<ApiResponse<Offer>>(`/offers/${offerId}/respond`, { status }).then((r) => r.data),
};
