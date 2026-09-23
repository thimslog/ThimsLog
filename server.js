const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server: SocketIOServer } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  const io = new SocketIOServer(server, {
    path: "/api/socket/io",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  // Store globally so route handlers and services in the Node runtime can access it
  globalThis.__io = io;

  io.on("connection", (socket) => {
    // User / room management
    socket.on("join_user", (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    socket.on("leave_user", (userId) => {
      if (userId) {
        socket.leave(`user_${userId}`);
      }
    });

    socket.on("join_ticket", (ticketId) => {
      if (ticketId) {
        socket.join(`ticket_${ticketId}`);
      }
    });

    socket.on("leave_ticket", (ticketId) => {
      if (ticketId) {
        socket.leave(`ticket_${ticketId}`);
      }
    });

    socket.on("join_admin", () => {
      socket.join("admin_portal");
      socket.join("admin_tickets");
    });

    socket.on("leave_admin", () => {
      socket.leave("admin_portal");
      socket.leave("admin_tickets");
    });

    socket.on("disconnect", () => {
      // Clean disconnect
    });
  });

  server.once("error", (err) => {
    console.error("Server error:", err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port} with Socket.IO enabled`);
  });
});
