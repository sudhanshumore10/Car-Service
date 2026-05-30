import api from "./api";

export type EstimateItem = {
  id: number | string;
  description: string;
  type: "SERVICE" | "PART";
  price: number;
  quantity: number;
  approved?: boolean;
};

export type EstimateHistoryItem = {
  version: number;
  createdAt: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
  items: EstimateItem[];
};

export type WorkOrderDetailsResponse = {
  workOrderId: number;
  bookingId: number;
  workshopId?: number;
  workshopName?: string;
  customerName?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehiclePlateNumber?: string;
  technicianId?: number;
  technicianName?: string;
  status: string;
  createdAt?: string;
  diagnosisChecklist: string[];
  diagnosisNotes: string;
  estimateItems: EstimateItem[];
  estimateHistory: EstimateHistoryItem[];
  estimateSubtotal: number;
  estimateTax: number;
  estimateDiscount: number;
  estimateTotal: number;
  estimateVersion: number;
  estimateStatus: string;
  approvalStatus: string;
  estimateSentAt?: string;
  approvalAt?: string;
  canConvertToJob: boolean;
};

export type TechnicianWorkOrderSummary = {
  workOrderId: number;
  bookingId: number;
  workshopId?: number;
  workshopName?: string;
  customerName?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehiclePlateNumber?: string;
  technicianId?: number;
  technicianName?: string;
  status: string;
  createdAt?: string;
  approvalStatus: string;
  estimateStatus: string;
  estimateTotal: number;
  estimateVersion: number;
};

export type InvoiceLineItem = {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  lineTotal: number;
  type: string;
};

export type InvoiceResponse = {
  invoiceId: number;
  workOrderId: number;
  status: string;
  paymentStatus: "PENDING" | "PARTIALLY_PAID" | "PAID";
  approvalStatus?: string;
  estimateStatus?: string;
  readyForPayment?: boolean;
  paymentMethod?: string;
  receiptNumber?: string;
  createdAt?: string;
  paidAt?: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  balanceAmount: number;
  customerName?: string;
  vehicle?: string;
  lineItems: InvoiceLineItem[];
  receipt?: {
    receiptNumber?: string;
    amountPaid: number;
    paidAt: string;
    method: string;
  };
};

export const getWorkOrderDetails = async (id: string | number) => {
  const response = await api.get<WorkOrderDetailsResponse>(`/technician/work-order/${id}`);
  return response.data;
};

export const getCustomerWorkOrderDetails = async (
  id: string | number,
  userId: string | number
) => {
  const response = await api.get<WorkOrderDetailsResponse>(`/customer/work-orders/${id}`, {
    params: { userId },
  });
  return response.data;
};

export const getTechnicianWorkOrders = async (
  userId: string | number,
  status?: string
) => {
  const response = await api.get<TechnicianWorkOrderSummary[]>(
    `/technician/work-order/technician/${userId}`,
    { params: status ? { status } : undefined }
  );
  return response.data;
};

export const getTechnicianOperationalQueue = async () => {
  const response = await api.get<TechnicianWorkOrderSummary[]>("/technician/work-order/queue");
  return response.data;
};

export const saveWorkOrderFindings = async (
  id: string | number,
  findings: { checklist: string[]; notes: string }
) => {
  const response = await api.post<WorkOrderDetailsResponse>(`/technician/work-order/${id}/findings`, findings);
  return response.data;
};

export const saveEstimateDraft = async (
  id: string | number,
  payload: { items: EstimateItem[]; sendToCustomer?: boolean }
) => {
  const response = await api.post<WorkOrderDetailsResponse>(`/technician/work-order/${id}/estimate`, payload);
  return response.data;
};

export const sendEstimateForApproval = async (
  id: string | number,
  items: EstimateItem[]
) => {
  const response = await api.post<WorkOrderDetailsResponse>(`/technician/work-order/${id}/estimate`, {
    items,
    sendToCustomer: true,
  });
  return response.data;
};

export const recordCustomerApproval = async (
  id: string | number,
  userId: string | number,
  approvalData: { items: EstimateItem[]; status: string; timestamp?: string }
) => {
  const response = await api.post<WorkOrderDetailsResponse>(`/customer/work-orders/${id}/approve`, approvalData, {
    params: { userId },
  });
  return response.data;
};

export const convertApprovedEstimate = async (id: string | number) => {
  const response = await api.post<WorkOrderDetailsResponse>(`/technician/work-order/${id}/convert`);
  return response.data;
};

export const getInvoiceByWorkOrder = async (workOrderId: string | number) => {
  const response = await api.get<InvoiceResponse>(`/parts/invoice/work-order/${workOrderId}`);
  return response.data;
};

export const getCustomerInvoices = async (userId: string | number) => {
  const response = await api.get<InvoiceResponse[]>(`/parts/invoices/customer/${userId}`);
  return response.data;
};

export const recordInvoicePayment = async (
  invoiceId: string | number,
  payload: { method: string; amount: number }
) => {
  const response = await api.post<InvoiceResponse>(`/parts/invoice/${invoiceId}/pay`, payload);
  return response.data;
};
