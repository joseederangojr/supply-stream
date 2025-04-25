# Instructions for LLMs on Generating Backend Code for the Procurement System

These instructions will guide you on generating maintainable, testable, and composable backend code for the procurement system microservices using the tech stack specified in the technical documentation.

## Core Principles

When generating code for this system, prioritize:

1. **Maintainability**: Write clean, well-documented code with consistent patterns
2. **Testability**: Structure code to be easily unit tested with dependency injection
3. **Composability**: Create modular components that can be combined and reused
4. **Type safety**: Leverage TypeScript throughout for type checking and documentation

## Service Structure Template

Each microservice should follow this consistent structure:

```
service-name/
├── src/
│   ├── api/             # API routes and handlers
│   ├── domain/          # Domain models and interfaces
│   ├── infrastructure/  # External dependencies and adapters
│   ├── repositories/    # Data access layer
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── config/          # Configuration management
│   └── index.ts         # Service entry point
├── test/                # Test files
├── Dockerfile           # Container definition
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Domain Modeling

Start with clear domain models that represent core business entities:

```typescript
// src/domain/models/Request.ts
export interface Request {
  id: string;
  clientId: string;
  branchId: string;
  requisitionNumber: string;
  title: string;
  description: string;
  requestorId: string;
  deliveryAddress: Address;
  deliveryCoordinates: GeoCoordinates;
  totalBudget: number;
  costCenter: string;
  urgency: RequestUrgency;
  status: RequestStatus;
  desiredDeliveryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum RequestStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum RequestUrgency {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}
```

## Repository Pattern

Implement the repository pattern for data access:

```typescript
// src/domain/repositories/RequestRepository.ts
import { Request } from '../models/Request';

export interface RequestRepository {
  findById(id: string): Promise<Request | null>;
  findByClientId(clientId: string, options?: PaginationOptions): Promise<Request[]>;
  create(request: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<Request>;
  update(id: string, request: Partial<Request>): Promise<Request | null>;
  delete(id: string): Promise<boolean>;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// src/repositories/PostgresRequestRepository.ts
import { RequestRepository } from '../domain/repositories/RequestRepository';
import { Request } from '../domain/models/Request';
import { db } from '../infrastructure/database';

export class PostgresRequestRepository implements RequestRepository {
  async findById(id: string): Promise<Request | null> {
    const result = await db
      .selectFrom('requests')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    
    return result ? this.mapToModel(result) : null;
  }
  
  // Implement other methods...
  
  private mapToModel(data: any): Request {
    return {
      id: data.id,
      clientId: data.client_id,
      // Map other fields...
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}
```

## Service Layer

Create services that implement business logic:

```typescript
// src/domain/services/RequestService.ts
import { Request } from '../models/Request';

export interface RequestService {
  getRequestById(id: string): Promise<Request | null>;
  createRequest(request: CreateRequestDto): Promise<Request>;
  updateRequest(id: string, updates: UpdateRequestDto): Promise<Request | null>;
  deleteRequest(id: string): Promise<boolean>;
  publishRequest(id: string): Promise<Request | null>;
}

export interface CreateRequestDto {
  clientId: string;
  branchId: string;
  title: string;
  description: string;
  requestorId: string;
  deliveryAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  totalBudget: number;
  costCenter?: string;
  urgency: string;
  desiredDeliveryDate?: Date;
}

export interface UpdateRequestDto {
  title?: string;
  description?: string;
  // Other updateable fields...
}

// src/services/RequestServiceImpl.ts
import { Request, RequestStatus } from '../domain/models/Request';
import { 
  RequestService, 
  CreateRequestDto, 
  UpdateRequestDto 
} from '../domain/services/RequestService';
import { RequestRepository } from '../domain/repositories/RequestRepository';
import { GeolocationService } from '../domain/services/GeolocationService';
import { NotificationService } from '../domain/services/NotificationService';
import { generateRequisitionNumber } from '../utils/idGenerator';

export class RequestServiceImpl implements RequestService {
  constructor(
    private requestRepository: RequestRepository,
    private geolocationService: GeolocationService,
    private notificationService: NotificationService
  ) {}
  
  async getRequestById(id: string): Promise<Request | null> {
    return this.requestRepository.findById(id);
  }
  
  async createRequest(dto: CreateRequestDto): Promise<Request> {
    // Geocode the address
    const coordinates = await this.geolocationService.geocodeAddress(dto.deliveryAddress);
    
    // Generate requisition number
    const requisitionNumber = generateRequisitionNumber();
    
    const request = await this.requestRepository.create({
      clientId: dto.clientId,
      branchId: dto.branchId,
      requisitionNumber,
      title: dto.title,
      description: dto.description,
      requestorId: dto.requestorId,
      deliveryAddress: dto.deliveryAddress,
      deliveryCoordinates: coordinates,
      totalBudget: dto.totalBudget,
      costCenter: dto.costCenter || '',
      urgency: dto.urgency,
      status: RequestStatus.DRAFT,
      desiredDeliveryDate: dto.desiredDeliveryDate || new Date()
    });
    
    return request;
  }
  
  async publishRequest(id: string): Promise<Request | null> {
    const request = await this.requestRepository.findById(id);
    
    if (!request) {
      return null;
    }
    
    const updatedRequest = await this.requestRepository.update(id, {
      status: RequestStatus.PUBLISHED
    });
    
    if (updatedRequest) {
      // Notify relevant suppliers
      await this.notificationService.notifySuppliers({
        requestId: updatedRequest.id,
        title: updatedRequest.title,
        clientId: updatedRequest.clientId
      });
    }
    
    return updatedRequest;
  }
  
  // Implement other methods...
}
```

## API Layer with Hono

Implement API routes with Hono:

```typescript
// src/api/routes/requestRoutes.ts
import { Hono } from 'hono';
import { RequestController } from '../controllers/RequestController';
import { authMiddleware } from '../middleware/authMiddleware';

export const createRequestRoutes = (controller: RequestController) => {
  const app = new Hono();
  
  // Apply authentication middleware
  app.use('*', authMiddleware);
  
  app.get('/api/v1/requests/:id', async (c) => {
    const id = c.req.param('id');
    const request = await controller.getRequestById(id);
    
    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }
    
    return c.json(request);
  });
  
  app.post('/api/v1/requests', async (c) => {
    try {
      const body = await c.req.json();
      const request = await controller.createRequest(body);
      return c.json(request, 201);
    } catch (error) {
      return c.json({ error: error.message }, 400);
    }
  });
  
  app.put('/api/v1/requests/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const request = await controller.updateRequest(id, body);
    
    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }
    
    return c.json(request);
  });
  
  app.post('/api/v1/requests/:id/publish', async (c) => {
    const id = c.req.param('id');
    
    const request = await controller.publishRequest(id);
    
    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }
    
    return c.json(request);
  });
  
  // Add other endpoints...
  
  return app;
};

// src/api/controllers/RequestController.ts
import { RequestService } from '../../domain/services/RequestService';

export class RequestController {
  constructor(private requestService: RequestService) {}
  
  async getRequestById(id: string) {
    return this.requestService.getRequestById(id);
  }
  
  async createRequest(data: any) {
    return this.requestService.createRequest(data);
  }
  
  async updateRequest(id: string, data: any) {
    return this.requestService.updateRequest(id, data);
  }
  
  async publishRequest(id: string) {
    return this.requestService.publishRequest(id);
  }
  
  // Other controller methods...
}
```

## Database Access with Kysely

Set up database access using Kysely:

```typescript
// src/infrastructure/database/index.ts
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { config } from '../../config';
import { Database } from './types';

// Create a connection pool
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
});

// Initialize kysely with the postgres dialect
export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
});

// src/infrastructure/database/types.ts
import { Generated } from 'kysely';

export interface Database {
  requests: RequestTable;
  items: ItemTable;
  // Other tables...
}

export interface RequestTable {
  id: Generated<string>;
  client_id: string;
  branch_id: string;
  requisition_number: string;
  title: string;
  description: string;
  requestor_id: string;
  delivery_address: object;
  delivery_latitude: number;
  delivery_longitude: number;
  total_budget: number;
  cost_center: string;
  urgency: string;
  status: string;
  desired_delivery_date: Date;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface ItemTable {
  id: Generated<string>;
  request_id: string;
  name: string;
  description: string;
  category: string;
  unit_of_measure: string;
  quantity: number;
  budget: number;
  supplier_can_attach: boolean;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}
```

## Dependency Injection

Set up a simple dependency injection system:

```typescript
// src/infrastructure/di/container.ts
import { RequestRepository } from '../../domain/repositories/RequestRepository';
import { PostgresRequestRepository } from '../../repositories/PostgresRequestRepository';
import { RequestService } from '../../domain/services/RequestService';
import { RequestServiceImpl } from '../../services/RequestServiceImpl';
import { GeolocationService } from '../../domain/services/GeolocationService';
import { GeolocationServiceImpl } from '../../services/GeolocationServiceImpl';
import { NotificationService } from '../../domain/services/NotificationService';
import { NotificationServiceImpl } from '../../services/NotificationServiceImpl';
import { RequestController } from '../../api/controllers/RequestController';

export interface Container {
  requestRepository: RequestRepository;
  geolocationService: GeolocationService;
  notificationService: NotificationService;
  requestService: RequestService;
  requestController: RequestController;
}

export function createContainer(): Container {
  // Create repositories
  const requestRepository = new PostgresRequestRepository();
  
  // Create services
  const geolocationService = new GeolocationServiceImpl();
  const notificationService = new NotificationServiceImpl();
  const requestService = new RequestServiceImpl(
    requestRepository,
    geolocationService,
    notificationService
  );
  
  // Create controllers
  const requestController = new RequestController(requestService);
  
  return {
    requestRepository,
    geolocationService,
    notificationService,
    requestService,
    requestController
  };
}
```

## Main Application Setup

Set up the main application entry point:

```typescript
// src/index.ts
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createContainer } from './infrastructure/di/container';
import { createRequestRoutes } from './api/routes/requestRoutes';
import { errorMiddleware } from './api/middleware/errorMiddleware';
import { config } from './config';
import { db } from './infrastructure/database';
import { logger } from './utils/logger';
import * as Sentry from '@sentry/node';

// Initialize Sentry for error tracking
Sentry.init({
  dsn: config.sentry.dsn,
  environment: config.environment
});

// Set up dependency injection
const container = createContainer();

// Create main application
const app = new Hono();

// Add global middleware
app.use('*', errorMiddleware);

// Mount routes
app.route('/api/v1/requests', createRequestRoutes(container.requestController));

// Health check endpoint
app.get('/health', (c) => c.json({ status: 'ok' }));

// Start the server
const port = parseInt(config.port || '3000', 10);
serve({
  fetch: app.fetch,
  port
}, () => {
  logger.info(`Server running on port ${port}`);
});

// Handle graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  // Close database connections
  await db.destroy();
  logger.info('Database connections closed');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
```

## Unit Testing

Write unit tests for your services:

```typescript
// test/services/RequestServiceImpl.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RequestServiceImpl } from '../../src/services/RequestServiceImpl';
import { RequestStatus } from '../../src/domain/models/Request';

// Mock dependencies
const mockRequestRepository = {
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findByClientId: vi.fn()
};

const mockGeolocationService = {
  geocodeAddress: vi.fn()
};

const mockNotificationService = {
  notifySuppliers: vi.fn()
};

// Mock ID generator
vi.mock('../../src/utils/idGenerator', () => ({
  generateRequisitionNumber: () => 'REQ-123456'
}));

describe('RequestServiceImpl', () => {
  let requestService: RequestServiceImpl;
  
  beforeEach(() => {
    vi.resetAllMocks();
    requestService = new RequestServiceImpl(
      mockRequestRepository as any,
      mockGeolocationService as any,
      mockNotificationService as any
    );
  });
  
  describe('createRequest', () => {
    it('should create a request with geocoded coordinates', async () => {
      // Arrange
      const createDto = {
        clientId: 'client-123',
        branchId: 'branch-123',
        title: 'Test Request',
        description: 'Test Description',
        requestorId: 'user-123',
        deliveryAddress: {
          street: '123 Main St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        },
        totalBudget: 1000,
        urgency: 'MEDIUM',
      };
      
      const mockCoordinates = { latitude: 40.7128, longitude: -74.0060 };
      mockGeolocationService.geocodeAddress.mockResolvedValue(mockCoordinates);
      
      const mockCreatedRequest = {
        id: 'request-123',
        ...createDto,
        requisitionNumber: 'REQ-123456',
        deliveryCoordinates: mockCoordinates,
        status: RequestStatus.DRAFT,
        costCenter: '',
        desiredDeliveryDate: expect.any(Date),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockRequestRepository.create.mockResolvedValue(mockCreatedRequest);
      
      // Act
      const result = await requestService.createRequest(createDto);
      
      // Assert
      expect(mockGeolocationService.geocodeAddress).toHaveBeenCalledWith(createDto.deliveryAddress);
      expect(mockRequestRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        clientId: createDto.clientId,
        branchId: createDto.branchId,
        requisitionNumber: 'REQ-123456',
        title: createDto.title,
        deliveryCoordinates: mockCoordinates,
        status: RequestStatus.DRAFT
      }));
      expect(result).toEqual(mockCreatedRequest);
    });
  });
  
  describe('publishRequest', () => {
    it('should update request status to PUBLISHED and notify suppliers', async () => {
      // Arrange
      const requestId = 'request-123';
      const mockRequest = {
        id: requestId,
        clientId: 'client-123',
        title: 'Test Request',
        status: RequestStatus.DRAFT
      };
      
      const mockUpdatedRequest = {
        ...mockRequest,
        status: RequestStatus.PUBLISHED
      };
      
      mockRequestRepository.findById.mockResolvedValue(mockRequest);
      mockRequestRepository.update.mockResolvedValue(mockUpdatedRequest);
      
      // Act
      const result = await requestService.publishRequest(requestId);
      
      // Assert
      expect(mockRequestRepository.findById).toHaveBeenCalledWith(requestId);
      expect(mockRequestRepository.update).toHaveBeenCalledWith(
        requestId, 
        { status: RequestStatus.PUBLISHED }
      );
      expect(mockNotificationService.notifySuppliers).toHaveBeenCalledWith({
        requestId: mockUpdatedRequest.id,
        title: mockUpdatedRequest.title,
        clientId: mockUpdatedRequest.clientId
      });
      expect(result).toEqual(mockUpdatedRequest);
    });
    
    it('should return null when request not found', async () => {
      // Arrange
      mockRequestRepository.findById.mockResolvedValue(null);
      
      // Act
      const result = await requestService.publishRequest('non-existent-id');
      
      // Assert
      expect(result).toBeNull();
      expect(mockRequestRepository.update).not.toHaveBeenCalled();
      expect(mockNotificationService.notifySuppliers).not.toHaveBeenCalled();
    });
  });
});
```

## Docker Configuration

Create a Dockerfile for containerization:

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build the application
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --production

# Copy built application
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Set healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Run the application
CMD ["node", "dist/index.js"]
```

## Observability Setup

Configure logging and monitoring:

```typescript
// src/utils/logger.ts
import * as winston from 'winston';
import { config } from '../config';

const logLevel = config.environment === 'production' ? 'info' : 'debug';

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: config.serviceName },
  transports: [
    new winston.transports.Console()
  ]
});

// src/api/middleware/errorMiddleware.ts
import { Context, Next } from 'hono';
import * as Sentry from '@sentry/node';
import { logger } from '../../utils/logger';

export async function errorMiddleware(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    // Capture exception in Sentry
    Sentry.captureException(error);
    
    // Log the error
    logger.error('Unhandled error', {
      error: {
        message: error.message,
        stack: error.stack
      },
      path: c.req.path,
      method: c.req.method
    });
    
    // Return error response
    return c.json(
      { 
        error: 'Internal Server Error',
        requestId: c.get('requestId') 
      }, 
      500
    );
  }
}
```

## Configuration Management

Handle configuration with environment variables:

```typescript
// src/config/index.ts
import dotenv from 'dotenv';

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

export const config = {
  environment: process.env.NODE_ENV || 'development',
  serviceName: process.env.SERVICE_NAME || 'procurement-service',
  port: process.env.PORT || '3000',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'procurement'
  },
  
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret',
    tokenExpiry: process.env.TOKEN_EXPIRY || '1d'
  },
  
  sentry: {
    dsn: process.env.SENTRY_DSN || ''
  },
  
  betterstack: {
    apiKey: process.env.BETTERSTACK_API_KEY || ''
  },
  
  azure: {
    servicebus: {
      connectionString: process.env.AZURE_SERVICEBUS_CONNECTION_STRING || '',
      queueName: process.env.AZURE_SERVICEBUS_QUEUE_NAME || ''
    },
    storage: {
      connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
      containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || ''
    }
  },
  
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
  }
};

// Validate required configuration
function validateConfig() {
  const requiredVars = [
    'database.host',
    'database.user',
    'database.password',
    'database.name',
    'auth.jwtSecret'
  ];
  
  // In production, ensure all required variables are set
  if (config.environment === 'production') {
    const missingVars = requiredVars.filter(path => {
      const value = path.split('.').reduce((obj, key) => obj[key], config);
      return !value;
    });
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }
}

// Call validation in production
if (config.environment === 'production') {
  validateConfig();
}
```

## Message Queue Integration

Set up Azure Service Bus for messaging between services:

```typescript
// src/infrastructure/messaging/serviceBus.ts
import { ServiceBusClient, ServiceBusMessage } from '@azure/service-bus';
import { config } from '../../config';
import { logger } from '../../utils/logger';

// Create a ServiceBusClient
const serviceBusClient = new ServiceBusClient(config.azure.servicebus.connectionString);

// Create a sender for the queue
const sender = serviceBusClient.createSender(config.azure.servicebus.queueName);

export async function sendMessage(messageBody: any, messageType: string): Promise<void> {
  try {
    const message: ServiceBusMessage = {
      body: messageBody,
      contentType: 'application/json',
      subject: messageType,
      messageId: `${messageType}-${Date.now()}`,
      applicationProperties: {
        messageType,
        timestamp: new Date().toISOString(),
        service: config.serviceName
      }
    };
    
    await sender.sendMessages(message);
    
    logger.debug('Message sent to Service Bus', {
      messageType,
      messageId: message.messageId
    });
  } catch (error) {
    logger.error('Failed to send message to Service Bus', {
      messageType,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
    throw error;
  }
}

export async function startMessageReceiver(
  queueName: string, 
  messageHandler: (message: any, messageType: string) => Promise<void>
): Promise<void> {
  const receiver = serviceBusClient.createReceiver(queueName);
  
  // Subscribe to messages
  receiver.subscribe({
    processMessage: async (message) => {
      try {
        const messageType = message.applicationProperties?.messageType as string;
        logger.debug('Received message from Service Bus', {
          messageType,
          messageId: message.messageId
        });
        
        await messageHandler(message.body, messageType);
      } catch (error) {
        logger.error('Error processing message', {
          messageId: message.messageId,
          error: {
            message: error.message,
            stack: error.stack
          }
        });
        
        // Rethrow to trigger the error handler and abandon the message
        throw error;
      }
    },
    processError: async (error) => {
      logger.error('Error in Service Bus receiver', {
        error: {
          message: error.message,
          stack: error.stack
        }
      });
    }
  });
  
  logger.info(`Message receiver started for queue: ${queueName}`);
}

// Handle graceful shutdown
export async function closeServiceBusConnections(): Promise<void> {
  try {
    await sender.close();
    await serviceBusClient.close();
    logger.info('Service Bus connections closed');
  } catch (error) {
    logger.error('Error closing Service Bus connections', {
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
}
```

## Package.json Example

```json
{
  "name": "procurement-service",
  "version": "1.0.0",
  "description": "Procurement service for the procurement platform",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint --ext .ts src",
    "format": "prettier --write 'src/**/*.ts'",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@azure/service-bus": "^7.9.0",
    "@azure/storage-blob": "^12.14.0",
    "@hono/node-server": "^1.0.1",
    "@sentry/node": "^7.52.1",
    "dotenv": "^16.0.3",
    "hono": "^3.2.2",
    "kysely": "^0.24.2",
    "pg": "^8.11.0",
    "stripe": "^12.8.0",
    "winston": "^3.8.2",
    "zod": "^3.21.4"
  },
  "devDependencies": {
    "@types/node": "^18.16.18",
    "@types/pg": "^8.10.1",
    "@typescript-eslint/eslint-plugin": "^5.59.9",
    "@typescript-eslint/parser": "^5.59.9",
    "eslint": "^8.42.0",
    "prettier": "^2.8.8",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.1.3",
    "vitest": "^0.31.4"
  }
}
```

## Best Practices Summary

1. **Project Structure**
   - Organize code by feature/domain
   - Separate concerns with clear boundaries
   - Use consistent naming conventions

2. **Dependencies**
   - Inject dependencies for testability
   - Use interfaces for loose coupling
   - Handle external dependencies through adapters

3. **Error Handling**
   - Use structured error types
   - Implement global error middleware
   - Log errors with context
   - Return meaningful error responses

4. **Testing**
   - Write unit tests for business logic
   - Mock external dependencies
   - Test edge cases and error paths
   - Use integration tests for API endpoints

5. **Performance**
   - Use connection pooling for databases
   - Implement proper error handling for external services
   - Set up graceful shutdown procedures

6. **Security**
   - Validate and sanitize all inputs
   - Use parameterized queries
   - Implement proper authentication and authorization
   - Keep secrets in environment variables

By following these instructions, you'll create maintainable, testable, and composable backend code for the procurement system using the specified tech stack.
