import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
export const runtime = "nodejs"; // Mongoose requires Node.js runtime, not edge
