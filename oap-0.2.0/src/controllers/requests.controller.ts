import type { Request, Response } from "express";
import { toRequestResponseDto } from "../dtos/requests.dto.js";
import { requestsService } from "../services/requests.service.js";

export const requestsController = {
  getAll(req: Request, res: Response) {
    const result = requestsService.getAll(req.query);
    res.status(200).json({
      ...result,
      items: result.items.map(toRequestResponseDto),
    });
  },

  getById(req: Request, res: Response) {
    const request = requestsService.getById(req.params.id);
    res.status(200).json(toRequestResponseDto(request));
  },

  create(req: Request, res: Response) {
    const request = requestsService.create(req.body);
    res.status(201).json(toRequestResponseDto(request));
  },

  update(req: Request, res: Response) {
    const request = requestsService.update(req.params.id, req.body);
    res.status(200).json(toRequestResponseDto(request));
  },

  patch(req: Request, res: Response) {
    const request = requestsService.patch(req.params.id, req.body);
    res.status(200).json(toRequestResponseDto(request));
  },

  delete(req: Request, res: Response) {
    requestsService.delete(req.params.id);
    res.status(204).send();
  },
};
