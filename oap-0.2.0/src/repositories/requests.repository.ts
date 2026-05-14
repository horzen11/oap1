import type { EquipmentRequest } from "../models/request.model.js";

const requests = new Map<string, EquipmentRequest>();

export const requestsRepository = {
  getAll(): EquipmentRequest[] {
    return Array.from(requests.values());
  },

  getById(id: string): EquipmentRequest | null {
    return requests.get(id) ?? null;
  },

  add(request: EquipmentRequest): EquipmentRequest {
    requests.set(request.id, request);
    return request;
  },

  update(id: string, request: EquipmentRequest): EquipmentRequest | null {
    if (!requests.has(id)) return null;
    requests.set(id, request);
    return request;
  },

  delete(id: string): boolean {
    return requests.delete(id);
  },
};
