import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useInfiniteQuery, useIsMutating } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { MessageRes, PlaylistRecommendation } from "@/utils/chat";
import { VirtualizerHandle, Virtualizer } from "virtua";
import { LoaderCircle } from "lucide-react";

export function Messages() {
  const { data, isPending, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery<MessageRes>({
      queryKey: ["messages"],
      queryFn: async ({ pageParam }) => {
        const res = await fetch(`/api/messages?cursor=${pageParam || ""}`);
        return res.json();
      },
      getNextPageParam: (lastPage) => lastPage.prevCursor ?? undefined,
      initialPageParam: undefined,
    });

  const isAddNewChat = useIsMutating({ mutationKey: ["new-chat"] });
  const messages = data ? data.pages.flatMap((d) => d.data).reverse() : [];

  const ref = useRef<VirtualizerHandle>(null);
  const isPrepend = useRef(false);
  const shouldStickToBottom = useRef(true);

  useLayoutEffect(() => {
    isPrepend.current = false;
  });

  useEffect(() => {
    if (!ref.current) return;
    const handle = ref.current;
    const lastItemIndex = messages.length - 1;
    if (shouldStickToBottom.current) {
      handle.scrollToIndex(lastItemIndex, { align: "end" });
    }
  }, [messages, isAddNewChat]);

  return (
    <div
      className="relative w-full max-w-xl overflow-hidden pr-0.5 md:pr-0 text-white flex flex-col"
      style={{ overflowY: "auto", flex: 1, overflowAnchor: "none" }}
    >
      {isPending ? (
        <ChatSkeleton />
      ) : (
        <div className="overflow-auto v-list" style={{ flexGrow: 1 }}>
          <div
            className="flex items-center w-full justify-center py-2"
            style={isFetchingNextPage ? undefined : { display: "none" }}
          >
            <LoaderCircle className="text-primary animate-spin" />
          </div>
          <Virtualizer
            ref={ref}
            data={messages}
            shift={isPrepend.current}
            onScroll={(offset) => {
              if (!ref.current) return;
              shouldStickToBottom.current =
                offset - ref.current.scrollSize + ref.current.viewportSize >=
                -1.5;

              if (hasNextPage && !isFetchingNextPage && offset < 100) {
                isPrepend.current = true;
                // alert("offset 100 boss");
                fetchNextPage();
              }
            }}
          >
            {(d, i) => <BubbleChat key={i} chat={d} />}
          </Virtualizer>
        </div>
      )}
    </div>
  );
}

function BubbleChat({ chat }: { chat: PlaylistRecommendation }) {
  const { data: session } = useSession();

  return (
    <div className="w-full flex flex-col my-1 px-0.5">
      <div
        className={cn(
          "relative flex items-center gap-2 py-2 pr-3 pl-2 w-fit",
          session?.user.id === chat.userId
            ? "max-w-[80%] self-end rounded-xl rounded-tr-sm bg-green-700"
            : "bg-background/40 break-after-all rounded-2xl rounded-tl-sm"
        )}
      >
        <div className="flex items-start gap-2">
          {session?.user.id !== chat.userId && (
            <img
              src={chat.recommendedBy.image}
              alt={chat.recommendedBy.name + " picture"}
              width={40}
              height={40}
              draggable={false}
              className="aspect-square h-6 w-6 rounded-full object-cover"
            />
          )}
          <div className="flex flex-col">
            {session?.user.id !== chat.userId && (
              <p className="font-semibold tagline">{chat.recommendedBy.name}</p>
            )}
            <span className="text-sm">{chat.songTitle}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="h-svh">
      <div className="relative flex mr-5 flex-col-reverse gap-1.5 px-2 pt-5">
        {Array.from({ length: 14 }).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "relative flex items-center gap-2 py-2 pr-3 pl-2",
              idx % 2 === 0
                ? "max-w-[80%] self-end rounded-2xl rounded-tr-sm bg-green-700"
                : "bg-background/40 w-fit rounded-2xl rounded-tl-sm"
            )}
          >
            <div className="flex items-start gap-2">
              {idx % 2 !== 0 && (
                <Skeleton className="aspect-square h-6 w-6 rounded-full" />
              )}
              <div className="flex flex-col gap-1">
                {idx % 2 !== 0 && (
                  <Skeleton className="bg-foreground/50 h-4 w-20" />
                )}
                <Skeleton
                  className={cn(
                    "bg-foreground/50 h-4",
                    idx % 3 === 0 ? "w-24" : idx % 3 === 1 ? "w-40" : "w-28"
                  )}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
