const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'MEDEBENA API ',
        version: '2.0.0',
        description: 'API documentation',
    },
    servers: [{ url: 'http://localhost:5000' }],
    components: {
        schemas: {
            Login: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                },
            },
            LoginResponse: {
                type: 'object',
                properties: {
                    token: { type: 'string' },
                    user: { type: 'object' },
                },
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    statusCode: { type: 'integer' },
                },
            },
        },
    },
}

export default {
    swaggerDefinition,
    apis: ['./routes/**/*.js'],
}
