import { SendHorizonal } from "lucide-react";
import { Input } from "./ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { useSession } from "@/lib/auth-client";
import { addChat, PlaylistRecommendation } from "@/utils/chat";
import { nanoid } from "nanoid";

export const AddChatForm = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const { mutate } = useMutation({
    mutationKey: ["new-chat"],
    mutationFn: addChat,
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (err) => {
      alert("error bosku, check console");
      console.error(err);
    },
  });
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    // TODO: add toast if not session

    mutate({
      data: {
        songTitle: formData.get("title"),
        songLink: formData.get("link"),
        userId: session?.user.id,
      },
    });

    queryClient.setQueryData(
      ["messages"],
      (old: { pages: { data: PlaylistRecommendation[] }[] }) => ({
        ...old,
        pages: [
          {
            ...old.pages[0],
            data: [
              {
                id: nanoid(),
                songTitle: formData.get("title"),
                songLink: formData.get("link"),
                userId: session?.user.id,
              },
              ...old.pages[0].data,
            ],
          },
        ],
      })
    );

    e.currentTarget.reset(); // optional: clear form
  };

  return (
    <form
      className="flex w-full items-center gap-2 overflow-hidden px-2 py-2"
      onSubmit={handleSubmit}
    >
      <Input
        type="text"
        name="title"
        placeholder="Bohemian Rhapsody"
        required
        className="bg-background/70"
      />
      <input
        type="text"
        name="link"
        placeholder="https://.."
        className="hidden"
      />
      <Button
        size="default"
        className="h-10 w-10 cursor-pointer rounded-full bg-green-600 hover:bg-green-700"
      >
        <SendHorizonal className="size-4 -rotate-12" />
      </Button>
    </form>
  );
};
