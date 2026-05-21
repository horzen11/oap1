import type { Request, Response } from "express";
import { toRequestResponseDto } from "../dtos/requests.dto.js";
import { requestsService } from "../services/requests.service.js";

export const requestsController = {
  async getAll(req: Request, res: Response) {
    const result = await requestsService.getAll(req.query);
    res.status(200).json({
      ...result,
      items: result.items.map(toRequestResponseDto),
    });
  },

  async getById(req: Request, res: Response) {
    const request = await requestsService.getById(req.params.id);
    res.status(200).json(toRequestResponseDto(request));
  },

  async searchUnsafe(req: Request, res: Response) {
    const items = await requestsService.searchUnsafe(req.query);
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

  async create(req: Request, res: Response) {
    const request = await requestsService.create(req.body);
    res.status(201).json(toRequestResponseDto(request));
  },

  async update(req: Request, res: Response) {
    const request = await requestsService.update(req.params.id, req.body);
    res.status(200).json(toRequestResponseDto(request));
  },

  async patch(req: Request, res: Response) {
    const request = await requestsService.patch(req.params.id, req.body);
    res.status(200).json(toRequestResponseDto(request));
  },

  async delete(req: Request, res: Response) {
    await requestsService.delete(req.params.id);
    res.status(204).send();
  },
};
