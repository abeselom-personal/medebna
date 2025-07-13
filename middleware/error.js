export const errorHandler = (err, req, res, _) => {
    console.error(err)
    const status = err.status || 500
    res.status(status).json({
        error: {
            message: err.message || 'Internal Server Error',
            code: status,
        },
    })
}
