// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - OPENAPI DOCUMENTATION
// Auto-generated API documentation with Scalar UI
// ══════════════════════════════════════════════════════════════════════════════

import { apiReference } from '@scalar/hono-api-reference'
import type { Hono } from 'hono'
import type { AppEnv } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// OpenAPI Specification
// ─────────────────────────────────────────────────────────────────────────────

export const openAPISpec = {
  openapi: '3.1.0',
  info: {
    title: 'VoxPoll API',
    version: '1.0.0',
    description: `
# VoxPoll API Documentation

VoxPoll is a democratic voice platform for creating and participating in polls, surveys, and tests.

## Authentication

Most endpoints require authentication via JWT Bearer token:
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

### Getting a Token

1. Register: \`POST /api/v1/auth/register\`
2. Login: \`POST /api/v1/auth/login\`
3. Use the returned \`accessToken\` in the Authorization header

### Token Refresh

When access token expires, use refresh token:
\`POST /api/v1/auth/refresh\` with \`refreshToken\` in body

## Rate Limiting

- **Anonymous**: 100 requests/minute
- **Authenticated**: 300 requests/minute
- **Auth endpoints**: Stricter limits (see individual endpoints)

Rate limit headers are included in responses:
- \`RateLimit-Limit\`: Maximum requests
- \`RateLimit-Remaining\`: Remaining requests
- \`RateLimit-Reset\`: Reset timestamp

## Error Responses

All errors follow this format:
\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
\`\`\`

## Pagination

List endpoints support pagination:
- \`page\`: Page number (default: 1)
- \`limit\`: Items per page (default: 20, max: 100)

Response includes:
\`\`\`json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
\`\`\`
    `,
    contact: {
      name: 'VoxPoll Support',
      email: 'support@voxpoll.app',
      url: 'https://voxpoll.app',
    },
    license: {
      name: 'Proprietary',
      url: 'https://voxpoll.app/terms',
    },
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local Development',
    },
    {
      url: 'https://api.voxpoll.app',
      description: 'Production',
    },
  ],
  tags: [
    { name: 'Health', description: 'Health check endpoints' },
    { name: 'Auth', description: 'Authentication & authorization' },
    { name: 'OAuth', description: 'Social login providers' },
    { name: 'Users', description: 'User profile management' },
    { name: 'Polls', description: 'Poll CRUD & voting' },
    { name: 'Surveys', description: 'B2B survey management' },
    { name: 'Tests', description: 'Quiz & assessment management' },
    { name: 'Discussions', description: 'Comments & threads' },
    { name: 'Notifications', description: 'User notifications' },
    { name: 'Gamification', description: 'Leaderboards & achievements' },
    { name: 'Organizations', description: 'Team & org management' },
    { name: 'Payments', description: 'Subscriptions & billing' },
    { name: 'Moderation', description: 'Content moderation' },
    { name: 'Categories', description: 'Content categories' },
    { name: 'Stats', description: 'Analytics & statistics' },
    { name: 'Live', description: 'Real-time polling' },
    { name: 'Uploads', description: 'File uploads' },
    { name: 'Search', description: 'Global search for polls, users, and tags' },
    { name: 'Feed', description: 'Personalized and trending content feeds' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token from login/register',
      },
    },
    schemas: {
      // Common schemas
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Invalid input data' },
            },
          },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 100 },
          totalPages: { type: 'integer', example: 5 },
          hasNext: { type: 'boolean', example: true },
          hasPrev: { type: 'boolean', example: false },
        },
      },
      // Auth schemas
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', minLength: 8, example: 'securePassword123' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
              expiresIn: { type: 'integer', example: 900 },
            },
          },
        },
      },
      // User schemas
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'cuid2' },
          email: { type: 'string', format: 'email' },
          username: { type: 'string' },
          displayName: { type: 'string' },
          avatarUrl: { type: 'string', format: 'uri', nullable: true },
          bio: { type: 'string', nullable: true },
          tier: { type: 'string', enum: ['FREE', 'PLUS', 'PREMIUM'] },
          emailVerified: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      // Poll schemas
      Poll: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'cuid2' },
          slug: { type: 'string' },
          question: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'] },
          visibility: { type: 'string', enum: ['PUBLIC', 'UNLISTED', 'PRIVATE'] },
          options: {
            type: 'array',
            items: { $ref: '#/components/schemas/PollOption' },
          },
          creator: { $ref: '#/components/schemas/User' },
          createdAt: { type: 'string', format: 'date-time' },
          endsAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      PollOption: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'cuid2' },
          text: { type: 'string' },
          imageUrl: { type: 'string', format: 'uri', nullable: true },
          position: { type: 'integer' },
        },
      },
      SearchResult: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['poll', 'user', 'tag'] },
          id: { type: 'string' },
          title: { type: 'string', nullable: true },
          username: { type: 'string', nullable: true },
          displayName: { type: 'string', nullable: true },
          avatarUrl: { type: 'string', format: 'uri', nullable: true },
          slug: { type: 'string', nullable: true },
          participantCount: { type: 'integer', nullable: true },
        },
      },
      SearchSuggestions: {
        type: 'object',
        properties: {
          polls: {
            type: 'array',
            items: { type: 'string' },
          },
          users: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                username: { type: 'string' },
                displayName: { type: 'string', nullable: true },
              },
            },
          },
        },
      },
      FeedItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'cuid2' },
          title: { type: 'string' },
          slug: { type: 'string' },
          type: { type: 'string', enum: ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'RANKING', 'RATING'] },
          status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'ENDED', 'ARCHIVED'] },
          participantCount: { type: 'integer' },
          hotScore: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          endsAt: { type: 'string', format: 'date-time', nullable: true },
          creator: { $ref: '#/components/schemas/UserSummary' },
          category: { $ref: '#/components/schemas/CategorySummary' },
        },
      },
      UserSummary: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'cuid2' },
          username: { type: 'string' },
          displayName: { type: 'string' },
          avatarUrl: { type: 'string', format: 'uri', nullable: true },
        },
      },
      CategorySummary: {
        type: 'object',
        nullable: true,
        properties: {
          id: { type: 'string', format: 'cuid2' },
          name: { type: 'string' },
          slug: { type: 'string' },
        },
      },
      Tag: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          count: { type: 'integer' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
}

// ─────────────────────────────────────────────────────────────────────────────
// Setup OpenAPI Routes
// ─────────────────────────────────────────────────────────────────────────────

export function setupOpenAPI(app: Hono<AppEnv>): Hono<AppEnv> {
  // Serve OpenAPI JSON spec
  app.get('/api/openapi.json', (c) => {
    return c.json(openAPISpec)
  })

  // Serve Scalar API Reference UI
  app.get(
    '/api/docs',
    apiReference({
      spec: {
        url: '/api/openapi.json',
      },
      theme: 'purple',
      layout: 'modern',
      darkMode: true,
      hideModels: false,
      hideDownloadButton: false,
      showSidebar: true,
      customCss: `
        .darklight { display: none; }
        .sidebar-heading { color: #6366f1; }
      `,
      metaData: {
        title: 'VoxPoll API Documentation',
        description: 'Interactive API documentation for VoxPoll',
      },
    })
  )

  return app
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export default setupOpenAPI
