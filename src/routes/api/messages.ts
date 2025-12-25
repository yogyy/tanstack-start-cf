import { createFileRoute } from "@tanstack/react-router";
import { createDB } from "@/lib/db";
import { playlistRecommendations as table } from "@/lib/db/schema";
import { json } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { lt } from "drizzle-orm";

export const Route = createFileRoute("/api/messages")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cursor = request.url.split("?cursor=")[1];
        const limit = 30 + 1;
        try {
          const messages = await createDB(
            env
          ).query.playlistRecommendations.findMany({
            orderBy: (t, { desc }) => [desc(t.createdAt), desc(t.id)],
            where: cursor ? lt(table.createdAt, new Date(cursor)) : undefined,
            limit,
            with: { recommendedBy: { columns: { name: true, image: true } } },
          });

          return json({
            data: messages,
            prevCursor:
              messages.length === limit
                ? messages.at(-1)?.createdAt.toISOString()
                : null,
            hasMore: messages.length === limit,
          });
        } catch (err) {
          console.log(err);
          return json({ error: "Failed to fetch messages" }, { status: 500 });
        }
      },
    },
  },
});
