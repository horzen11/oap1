import type { Request, Response } from "express";
import { toUserResponseDto } from "../dtos/users.dto.js";
import { usersService } from "../services/users.service.js";

export const usersController = {
  async getAll(req: Request, res: Response) {
    const result = await usersService.getAll(req.query);
    res.status(200).json({
      ...result,
      items: result.items.map(toUserResponseDto),
    });
  },

  async getById(req: Request, res: Response) {
    const user = await usersService.getById(req.params.id);
    res.status(200).json(toUserResponseDto(user));
  },

  async create(req: Request, res: Response) {
    const user = await usersService.create(req.body);
    res.status(201).json(toUserResponseDto(user));
  },

  async update(req: Request, res: Response) {
    const user = await usersService.update(req.params.id, req.body);
    res.status(200).json(toUserResponseDto(user));
  },

  async delete(req: Request, res: Response) {
    await usersService.delete(req.params.id);
    res.status(204).send();
  },
};
