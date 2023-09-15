export const routeNotFoundHandler = (req, res) => {
    res.status(404).json({success: false, error: `Route ${req.originalUrl} does not exist`})
}