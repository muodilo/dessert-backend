import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dessert Backend API',
      version: '1.0.0',
      description: 'A secure REST API for dessert management with authentication, categories, products, and cart functionality',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            id: {
              type: 'string',
              description: 'The auto-generated id of the user',
            },
            username: {
              type: 'string',
              description: 'The username of the user',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'The email of the user',
            },
            role: {
              type: 'string',
              enum: ['customer', 'vendor', 'admin'],
              description: 'The role of the user',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date the user was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date the user was last updated',
            },
          },
        },
        UserInput: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'The username for registration',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'The email for registration',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'The password for registration',
            },
            role: {
              type: 'string',
              enum: ['customer', 'vendor', 'admin'],
              description: 'The role for registration (optional, defaults to customer)',
            },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'The email for login',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'The password for login',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Login successful',
            },
            data: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'The user id',
                },
                username: {
                  type: 'string',
                  description: 'The username',
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'The email',
                },
                role: {
                  type: 'string',
                  enum: ['customer', 'vendor', 'admin'],
                  description: 'The user role',
                },
                token: {
                  type: 'string',
                  description: 'JWT token for authentication',
                },
              },
            },
          },
        },
        PasswordChange: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: {
              type: 'string',
              format: 'password',
              description: 'The current password',
            },
            newPassword: {
              type: 'string',
              format: 'password',
              description: 'The new password',
            },
          },
        },
        UserUpdate: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'The new username',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'The new email',
            },
            role: {
              type: 'string',
              enum: ['customer', 'vendor', 'admin'],
              description: 'The new role (admin only)',
            },
          },
        },
        Category: {
          type: 'object',
          required: ['name'],
          properties: {
            id: {
              type: 'string',
              description: 'The auto-generated id of the category',
            },
            name: {
              type: 'string',
              description: 'The name of the category',
            },
            description: {
              type: 'string',
              description: 'The description of the category',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date the category was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date the category was last updated',
            },
          },
        },
        CategoryInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              description: 'The name of the category',
            },
            description: {
              type: 'string',
              description: 'The description of the category',
            },
          },
        },
        Product: {
          type: 'object',
          required: ['name', 'price', 'categoryId', 'vendorId'],
          properties: {
            id: {
              type: 'string',
              description: 'The auto-generated id of the product',
            },
            name: {
              type: 'string',
              description: 'The name of the product',
            },
            price: {
              type: 'number',
              description: 'The price of the product',
            },
            description: {
              type: 'string',
              description: 'The description of the product',
            },
            categoryId: {
              type: 'string',
              description: 'The category ID this product belongs to',
            },
            vendorId: {
              type: 'string',
              description: 'The vendor ID who created this product',
            },
            inStock: {
              type: 'boolean',
              description: 'Whether the product is in stock',
            },
            quantity: {
              type: 'integer',
              description: 'The quantity available',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date the product was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date the product was last updated',
            },
          },
        },
        ProductInput: {
          type: 'object',
          required: ['name', 'price', 'categoryId'],
          properties: {
            name: {
              type: 'string',
              description: 'The name of the product',
            },
            price: {
              type: 'number',
              description: 'The price of the product',
            },
            description: {
              type: 'string',
              description: 'The description of the product',
            },
            categoryId: {
              type: 'string',
              description: 'The category ID',
            },
            inStock: {
              type: 'boolean',
              description: 'Whether the product is in stock',
            },
            quantity: {
              type: 'integer',
              description: 'The quantity available',
            },
          },
        },
        Cart: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The auto-generated id of the cart',
            },
            userId: {
              type: 'string',
              description: 'The user ID this cart belongs to',
            },
            products: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/CartItem',
              },
              description: 'Array of products in the cart',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date the cart was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date the cart was last updated',
            },
          },
        },
        CartItem: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: {
              type: 'string',
              description: 'The product ID',
            },
            quantity: {
              type: 'integer',
              description: 'The quantity of the product in the cart',
            },
          },
        },
        CartUpdate: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: {
              type: 'string',
              description: 'The product ID to update',
            },
            quantity: {
              type: 'integer',
              description: 'The new quantity for the product',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully',
            },
          },
        },
        DataResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              description: 'The response data',
            },
          },
        },
        ListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            count: {
              type: 'integer',
              description: 'Number of items in the list',
            },
            data: {
              type: 'array',
              description: 'Array of items',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.ts', './controllers/*.ts'], // paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJsdoc(options);