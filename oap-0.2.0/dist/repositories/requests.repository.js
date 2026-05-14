const requests = new Map();
export const requestsRepository = {
    getAll() {
        return Array.from(requests.values());
    },
    getById(id) {
        return requests.get(id) ?? null;
    },
    add(request) {
        requests.set(request.id, request);
        return request;
    },
    update(id, request) {
        if (!requests.has(id))
            return null;
        requests.set(id, request);
        return request;
    },
    delete(id) {
        return requests.delete(id);
    },
};
