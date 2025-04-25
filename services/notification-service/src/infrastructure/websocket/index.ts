import { Server } from "socket.io"
import type { Server as HttpServer } from "http"
import jwt from "jsonwebtoken"
import { logger } from "../../utils/logger"
import { config } from "../../config"

interface AuthenticatedSocket {
  userId: string
  organizationId: string
}

export class WebSocketServer {
  private io: Server
  private userSockets: Map<string, string[]> = new Map()

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.corsOrigins,
        methods: ["GET", "POST"],
        credentials: true,
      },
      path: "/ws",
    })

    this.setupMiddleware()
    this.setupEventHandlers()

    logger.info("WebSocket server initialized")
  }

  private setupMiddleware() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error("Authentication error: Token missing"))
      }

      try {
        const decoded = jwt.verify(token, config.jwtSecret) as {
          userId: string
          organizationId: string
        }
        ;(socket as any).userId = decoded.userId
        ;(socket as any).organizationId = decoded.organizationId

        next()
      } catch (error) {
        logger.error("WebSocket authentication error", { error })
        next(new Error("Authentication error: Invalid token"))
      }
    })
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket) => {
      const userId = (socket as any).userId
      logger.info(`User connected to WebSocket`, { userId, socketId: socket.id })

      // Store socket ID for this user
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, [])
      }
      this.userSockets.get(userId)?.push(socket.id)

      // Join user-specific room
      socket.join(`user:${userId}`)

      // Join organization-specific room
      const organizationId = (socket as any).organizationId
      socket.join(`organization:${organizationId}`)

      socket.on("disconnect", () => {
        logger.info(`User disconnected from WebSocket`, { userId, socketId: socket.id })

        // Remove socket ID from user's sockets
        const userSocketIds = this.userSockets.get(userId) || []
        const updatedSocketIds = userSocketIds.filter((id) => id !== socket.id)

        if (updatedSocketIds.length > 0) {
          this.userSockets.set(userId, updatedSocketIds)
        } else {
          this.userSockets.delete(userId)
        }
      })
    })
  }

  public sendToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data)
    logger.debug(`Sent ${event} to user`, { userId })
  }

  public sendToOrganization(organizationId: string, event: string, data: any) {
    this.io.to(`organization:${organizationId}`).emit(event, data)
    logger.debug(`Sent ${event} to organization`, { organizationId })
  }

  public broadcastSystemNotification(event: string, data: any) {
    this.io.emit(event, data)
    logger.debug(`Broadcast system notification: ${event}`)
  }
}

export let webSocketServer: WebSocketServer

export const initializeWebSocketServer = (httpServer: HttpServer) => {
  webSocketServer = new WebSocketServer(httpServer)
  return webSocketServer
}
