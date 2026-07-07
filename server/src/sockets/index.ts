import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "http";
import { verifyAccessToken } from "../services/auth.service";

let io: SocketIOServer | null = null;

/** 종업원/관리자만 신규 주문 알림을 받도록 "staff" room에 join */
export function initSockets(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    const token = socket.handshake.auth?.token;
    try {
      const payload = token ? verifyAccessToken(token) : null;
      if (payload && (payload.role === "STAFF" || payload.role === "ADMIN")) {
        socket.join("staff");
      }
    } catch {
      /* 인증 실패 시 room에 참여하지 않음 (알림 미수신) */
    }
  });

  return io;
}

export function emitNewOrder(order: unknown) {
  io?.to("staff").emit("order:new", order);
}
