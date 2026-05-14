import { toRequestResponseDto } from "../dtos/requests.dto.js";
import { requestsService } from "../services/requests.service.js";
export const requestsController = {
    getAll(req, res) {
        const result = requestsService.getAll(req.query);
        res.status(200).json({
            ...result,
            items: result.items.map(toRequestResponseDto),
        });
    },
    getById(req, res) {
        const request = requestsService.getById(req.params.id);
        res.status(200).json(toRequestResponseDto(request));
    },
    create(req, res) {
        const request = requestsService.create(req.body);
        res.status(201).json(toRequestResponseDto(request));
    },
    update(req, res) {
        const request = requestsService.update(req.params.id, req.body);
        res.status(200).json(toRequestResponseDto(request));
    },
    patch(req, res) {
        const request = requestsService.patch(req.params.id, req.body);
        res.status(200).json(toRequestResponseDto(request));
    },
    delete(req, res) {
        requestsService.delete(req.params.id);
        res.status(204).send();
    },
};
