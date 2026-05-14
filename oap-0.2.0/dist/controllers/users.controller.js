import { toUserResponseDto } from "../dtos/users.dto.js";
import { usersService } from "../services/users.service.js";
export const usersController = {
    getAll(req, res) {
        const result = usersService.getAll(req.query);
        res.status(200).json({
            ...result,
            items: result.items.map(toUserResponseDto),
        });
    },
    getById(req, res) {
        const user = usersService.getById(req.params.id);
        res.status(200).json(toUserResponseDto(user));
    },
    create(req, res) {
        const user = usersService.create(req.body);
        res.status(201).json(toUserResponseDto(user));
    },
    update(req, res) {
        const user = usersService.update(req.params.id, req.body);
        res.status(200).json(toUserResponseDto(user));
    },
    delete(req, res) {
        usersService.delete(req.params.id);
        res.status(204).send();
    },
};
