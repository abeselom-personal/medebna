export const registerSchema = {
    type: 'object',
    required: ['firstName', 'lastName', 'email', 'phone', 'password'],
    properties: {
        firstName: { type: 'string', minLength: 1 },
        lastName: { type: 'string', minLength: 1 },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
        password: { type: 'string', minLength: 6 },
    },
    additionalProperties: false,
}

export const registerResponseSchema = {
    type: 'object',
    properties: {
        user: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                email: { type: 'string' },
            },
        },
    },
}

export const loginSchema = {
    type: 'object',
    required: ['email', 'password'],
    properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 6 },
    },
    additionalProperties: false,
}

export const loginResponseSchema = {
    type: 'object',
    properties: {
        accessToken: { type: 'string' },
        user: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                email: { type: 'string' },
            },
        },
    },
}

export const refreshResponseSchema = {
    type: 'object',
    properties: {
        accessToken: { type: 'string' },
    },
}
