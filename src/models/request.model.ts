export type RequestStatus = "New" | "Approved" | "Rejected";

export type EquipmentRequest = {
  id: string;
  itemCode: string;
  userId: string;
  userName: string;
  ownerUserId: string;
  dateFrom: string;
  dateTo: string;
  comment: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
};
