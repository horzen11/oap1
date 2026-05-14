export function notFoundHandler(req, res) {
    res.status(404).json({
        error: {
            code: "ROUTE_NOT_FOUND",
            message: `Route ${req.method} ${req.originalUrl} not found`,
            details: null,
        },
    });
}
