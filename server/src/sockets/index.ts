import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "http";
import { verifyAccessToken } from "../services/auth.service";

let io: SocketIOServer | null = null;

/**
 * 종업원/관리자는 "staff" room에서 신규 주문 알림을 받고,
 * 로그인한 고객은 "user:{id}" room에서 본인 주문의 상태 변경 알림을 받는다.
 */
export function initSockets(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, { cors: { origin: "*" } });

  /* accessToken이 만료된 채로 (재)연결을 시도하면 접속 자체를 거부해서
     클라이언트가 "connect_error"를 받고 토큰을 갱신한 뒤 재시도하게 한다.
     이전에는 연결은 무조건 받아준 뒤 room 참여만 조용히 건너뛰어서,
     클라이언트가 실패를 알 방법이 없어 알림을 영영 못 받는 문제가 있었다. */
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    try {
      const payload = token ? verifyAccessToken(token) : null;
      if (!payload) return next(new Error("unauthorized"));
      socket.data.user = payload;
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const payload = socket.data.user;
    if (payload.role === "STAFF" || payload.role === "ADMIN") {
      socket.join("staff");
    }
    socket.join(`user:${payload.sub}`);
  });

  return io;
}

export function emitNewOrder(order: unknown) {
  io?.to("staff").emit("order:new", order);
}

export function emitOrderStatusUpdate(userId: number, order: unknown) {
  io?.to(`user:${userId}`).emit("order:status", order);
}
