export const errorResponseSchema = {
    type: 'object',
    properties: {
        error: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                code: { type: 'number' },
            },
            required: ['message', 'code'],
        },
    },
}
