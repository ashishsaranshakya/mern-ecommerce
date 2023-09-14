export const routeNotFoundHandler = (req, res) => {
    res.status(404).json({success: false, error: 'Route does not exist'})
}