import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { env } from "../config";
import { logger } from "../utils/logger";
import { verifyAccessToken } from "../utils/jwt";

let io: SocketIOServer | null = null;

export function setupSocketIO(server: HTTPServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Redis adapter for horizontal scaling
  if (env.REDIS_URL) {
    try {
      const pubClient = createClient({ url: env.REDIS_URL });
      const subClient = pubClient.duplicate();

      pubClient.on("error", (err) => {
        logger.error({ error: err }, "Redis pub client error");
      });

      subClient.on("error", (err) => {
        logger.error({ error: err }, "Redis sub client error");
      });

      // Connect clients
      pubClient.connect().catch((err) => {
        logger.error({ error: err }, "Failed to connect Redis pub client");
      });

      subClient.connect().catch((err) => {
        logger.error({ error: err }, "Failed to connect Redis sub client");
      });

      io?.adapter(createAdapter(pubClient, subClient));
      logger.info("Socket.io Redis adapter connected");
    } catch (error) {
      logger.error({ error }, "Failed to connect Redis adapter for Socket.io");
    }
  }

  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        logger.warn({ socketId: socket.id }, "Socket connection rejected: No token provided");
        return next(new Error("Authentication required"));
      }

      // Verify JWT token
      const payload = verifyAccessToken(token);
      
      // Attach user info to socket for use in handlers
      (socket as any).user = payload;
      
      logger.debug({ socketId: socket.id, userId: payload.sub }, "Socket authenticated");
      next();
    } catch (error) {
      logger.warn({ socketId: socket.id, error }, "Socket connection rejected: Invalid token");
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "Client connected");

    // Join hackathon room
    socket.on("join:hackathon", (hackathonId: string) => {
      socket.join(`hackathon:${hackathonId}`);
      logger.debug({ socketId: socket.id, hackathonId }, "Joined hackathon room");
    });

    // Leave hackathon room
    socket.on("leave:hackathon", (hackathonId: string) => {
      socket.leave(`hackathon:${hackathonId}`);
      logger.debug({ socketId: socket.id, hackathonId }, "Left hackathon room");
    });

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "Client disconnected");
    });
  });

  logger.info("Socket.io server initialized");
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

// Helper to broadcast leaderboard updates
export function broadcastLeaderboardUpdate(hackathonId: string, leaderboard: any) {
  if (io) {
    io.to(`hackathon:${hackathonId}`).emit("leaderboard:update", leaderboard);
  }
}

