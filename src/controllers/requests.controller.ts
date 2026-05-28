import type { Request, Response } from "express";
import { toRequestResponseDto } from "../dtos/requests.dto.js";
import { requestsService } from "../services/requests.service.js";
import { requireCurrentUser } from "../middleware/demo-auth.middleware.js";

export const requestsController = {
  async getAll(req: Request, res: Response) {
    const currentUser = requireCurrentUser(req);
    const result = await requestsService.getAll(req.query, currentUser.id);
    res.status(200).json({
      ...result,
      items: result.items.map(toRequestResponseDto),
    });
  },

  async getById(req: Request, res: Response) {
    const currentUser = requireCurrentUser(req);
    const request = await requestsService.getById(req.params.id, currentUser.id);
    res.status(200).json(toRequestResponseDto(request));
  },

  async searchSafe(req: Request, res: Response) {
    const currentUser = requireCurrentUser(req);
    const items = await requestsService.searchSafe(req.query, currentUser.id);
    res.status(200).json({ items: items.map(toRequestResponseDto), total: items.length });
  },

  async getWithUsers(req: Request, res: Response) {
    const items = await requestsService.getWithUsers(req.query);
    res.status(200).json({ items, total: items.length });
  },

  async getLatestByStatus(req: Request, res: Response) {
    const items = await requestsService.getLatestByStatus(req.query);
    res.status(200).json({ items: items.map(toRequestResponseDto), total: items.length });
  },

  async getStatsByStatus(_req: Request, res: Response) {
    const items = await requestsService.getStatsByStatus();
    res.status(200).json({ items });
  },

  async getFullStats(req: Request, res: Response) {
    const stats = await requestsService.getFullStats(req.query);
    res.status(200).json({ data: stats });
  },

  async create(req: Request, res: Response) {
    const currentUser = requireCurrentUser(req);
    const request = await requestsService.create(req.body, currentUser.id);
    res.status(201).json(toRequestResponseDto(request));
  },

  async update(req: Request, res: Response) {
    const currentUser = requireCurrentUser(req);
    const request = await requestsService.update(req.params.id, req.body, currentUser.id);
    res.status(200).json(toRequestResponseDto(request));
  },

  async patch(req: Request, res: Response) {
    const currentUser = requireCurrentUser(req);
    const request = await requestsService.patch(req.params.id, req.body, currentUser.id);
    res.status(200).json(toRequestResponseDto(request));
  },

  async delete(req: Request, res: Response) {
    const currentUser = requireCurrentUser(req);
    await requestsService.delete(req.params.id, currentUser.id);
    res.status(204).send();
  },
};
