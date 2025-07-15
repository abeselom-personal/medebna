const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'MEDEBENA API ',
        version: '2.0.0',
        description: 'API documentation',
    },
    servers: [{ url: 'http://localhost:5000' }],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            Register: {
                type: 'object',
                required: ['firstName', 'lastName', 'email', 'phone'],
                properties: {
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    password: { type: 'string' },
                },
                example: {
                    firstName: 'Abeselom',
                    lastName: 'Solomon',
                    email: 'abeselom@example.com',
                    phone: '0912345678',
                    password: 'test123',
                },
            },
            Login: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string' },
                    password: { type: 'string' },
                },
                example: {
                    email: 'abeselom@example.com',
                    password: 'Abebe1234',
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
            RegisterResponse: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    user: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            email: { type: 'string' },
                            phone: { type: 'string' },
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                        },
                    },
                },
            },
            RefreshResponse: {
                type: 'object',
                properties: {
                    accessToken: { type: 'string' },
                },
            },

            PaginatedRoomResponse: {
                type: 'object',
                properties: {
                    data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Room' }
                    },
                    meta: {
                        type: 'object',
                        properties: {
                            page: { type: 'integer' },
                            limit: { type: 'integer' },
                            total: { type: 'integer' },
                            pages: { type: 'integer' }
                        }
                    }
                }
            },

            PaginatedEventResponse: {
                type: 'object',
                properties: {
                    data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Event' }
                    },
                    meta: {
                        type: 'object',
                        properties: {
                            page: { type: 'integer' },
                            limit: { type: 'integer' },
                            total: { type: 'integer' },
                            pages: { type: 'integer' }
                        }
                    }
                }
            },

            Room: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    images: { type: 'array', items: { type: 'string' } },
                    price: { type: 'number' },
                    location: { type: 'string' },
                    availability: {
                        type: 'object',
                        properties: {
                            from: { type: 'string', format: 'date' },
                            to: { type: 'string', format: 'date' }
                        }
                    },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' }
                }
            },

            Event: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    images: { type: 'array', items: { type: 'string' } },
                    price: { type: 'number' },
                    location: { type: 'string' },
                    date: { type: 'string', format: 'date' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' }
                }
            }
        },
    },
}

export default {
    swaggerDefinition,
    apis: ['./routes/**/*.js'],
}
