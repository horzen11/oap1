import type { Request, Response } from "express";
import { toRequestCommentResponseDto } from "../dtos/request-comments.dto.js";
import { requestCommentsService } from "../services/request-comments.service.js";

export const requestCommentsController = {
  async getAll(_req: Request, res: Response) {
    const items = await requestCommentsService.getAll();
    res.status(200).json({ items: items.map(toRequestCommentResponseDto), total: items.length });
  },

  async getById(req: Request, res: Response) {
    const comment = await requestCommentsService.getById(req.params.id);
    res.status(200).json(toRequestCommentResponseDto(comment));
  },

  async getByRequestId(req: Request, res: Response) {
    const items = await requestCommentsService.getByRequestId(req.params.requestId);
    res.status(200).json({ items: items.map(toRequestCommentResponseDto), total: items.length });
  },

  async create(req: Request, res: Response) {
    const comment = await requestCommentsService.create(req.body);
    res.status(201).json(toRequestCommentResponseDto(comment));
  },

  async update(req: Request, res: Response) {
    const comment = await requestCommentsService.update(req.params.id, req.body);
    res.status(200).json(toRequestCommentResponseDto(comment));
  },

  async patch(req: Request, res: Response) {
    const comment = await requestCommentsService.patch(req.params.id, req.body);
    res.status(200).json(toRequestCommentResponseDto(comment));
  },

  async delete(req: Request, res: Response) {
    await requestCommentsService.delete(req.params.id);
    res.status(204).send();
  },
};
