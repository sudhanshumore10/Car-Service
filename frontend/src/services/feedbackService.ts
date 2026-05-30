import api from "./api";

export type FeedbackEligible = {
  workOrderId: number;
  bookingId?: number;
  workshopName?: string;
  vehicle?: string;
  status?: string;
};

export type FeedbackRecord = {
  id: number;
  workOrderId?: number;
  bookingId?: number;
  customerName?: string;
  workshopName?: string;
  vehicle?: string;
  rating?: number;
  comments?: string;
  tags?: string;
  managerResponse?: string;
  submittedAt?: string;
  managerRespondedAt?: string;
};

export const getEligibleFeedbackWorkOrders = async (userId: number) => {
  return await api.get<FeedbackEligible[]>("/customer/feedback/eligible", {
    params: { userId },
  });
};

export const getCustomerFeedback = async (userId: number) => {
  return await api.get<FeedbackRecord[]>("/customer/feedback", {
    params: { userId },
  });
};

export const submitFeedback = async (payload: {
  userId: number;
  workOrderId: number;
  rating: number;
  comments: string;
  tags: string;
}) => {
  return await api.post<FeedbackRecord>("/customer/feedback", payload);
};

export const getManagerFeedback = async () => {
  return await api.get<FeedbackRecord[]>("/manager/feedback");
};

export const respondToFeedback = async (feedbackId: number, managerResponse: string) => {
  return await api.put<FeedbackRecord>(`/manager/feedback/${feedbackId}/response`, {
    managerResponse,
  });
};
