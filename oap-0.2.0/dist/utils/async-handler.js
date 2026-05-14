export function asyncHandler(handler) {
    return (req, res, next) => {
        try {
            handler(req, res, next);
        }
        catch (error) {
            next(error);
        }
    };
}
