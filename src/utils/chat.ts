import { createDB } from "@/lib/db";
import { playlistRecommendations, Recomendation } from "@/lib/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { nanoid } from "nanoid";
import z4 from "zod/v4";

const newChatSchema = z4.object({
  userId: z4.string(),
  songTitle: z4.string(),
  songLink: z4.string().optional(),
});

export const addChat = createServerFn({ method: "POST" })
  .inputValidator((song: unknown) => newChatSchema.parse(song))
  .handler(async ({ data }) => {
    try {
      const [playlist] = await createDB(env)
        .insert(playlistRecommendations)
        .values({
          id: nanoid(),
          ...data,
        })
        .returning();
      setResponseStatus(201);
      return { playlist };
    } catch (err) {
      console.error(err);
      setResponseStatus(500);
      return { error: "Failed to create playlist" };
    }
  });

export type PlaylistRecommendation = Recomendation & {
  recommendedBy: { name: string; image: string };
};

export interface MessageRes {
  data: PlaylistRecommendation[];
  prevCursor: string | null;
  // nextCursor: string | null;
}

export const fetchChats = async ({
  pageParam,
}: {
  pageParam?: Date | string;
}): Promise<MessageRes> => {
  const res = await fetch(`/api/messages?cursor=${pageParam || ""}`);
  return res.json();
};
