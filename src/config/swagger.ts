import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'School Management API',
      version: '1.0.0',
      description: 'Multi-tenant SaaS School Management System API',
    },
    servers: [
      { url: '/api/v1', description: 'API v1' },
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
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Invalid input' },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      path: { type: 'string' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 5 },
          },
        },
      },
      parameters: {
        PageParam: {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1, default: 1 },
          description: 'Page number',
        },
        LimitParam: {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          description: 'Items per page',
        },
        SearchParam: {
          in: 'query',
          name: 'search',
          schema: { type: 'string' },
          description: 'Search term',
        },
      },
      responses: {
        Unauthorized: {
          description: 'Missing or invalid authentication',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        Forbidden: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication & authorization' },
      { name: 'Users', description: 'User management' },
      { name: 'Schools', description: 'School management' },
      { name: 'Roles', description: 'Role management' },
      { name: 'Academic Years', description: 'Academic year management' },
      { name: 'Terms', description: 'Term management' },
      { name: 'Departments', description: 'Department management' },
      { name: 'Grades', description: 'Grade management' },
      { name: 'Subjects', description: 'Subject management' },
      { name: 'Class Sections', description: 'Class section management' },
      { name: 'Students', description: 'Student management' },
      { name: 'Guardians', description: 'Guardian management' },
      { name: 'Enrollments', description: 'Student enrollment management' },
      { name: 'Teachers', description: 'Teacher management' },
      { name: 'Timetable', description: 'Timetable & scheduling' },
      { name: 'Substitutions', description: 'Teacher substitutions' },
      { name: 'Attendance', description: 'Student & teacher attendance' },
      { name: 'Exams', description: 'Exam management' },
      { name: 'Student Grades', description: 'Student grade records' },
      { name: 'Report Cards', description: 'Report card snapshots' },
      { name: 'Fees', description: 'Fee management & invoicing' },
      { name: 'Announcements', description: 'School announcements' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'Academic Events', description: 'Calendar events' },
      { name: 'Audit Logs', description: 'System audit trail' },
      { name: 'Self-Service', description: 'Teacher/student/guardian self-service' },
      { name: 'Dashboard', description: 'Admin dashboards' },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
