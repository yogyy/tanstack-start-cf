import { SimpleIconsGoolge } from "@/components/icons/simple-icon";
import { Messages } from "@/components/Messages";
import { AddChatForm } from "@/components/NewChatForm";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "@/lib/auth-client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/chat/")({
  head: () => ({
    meta: [{ title: "Public Chat" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = useSession();

  return (
    <main className="bg-zinc-800 bg-[url(/pattern.png)] bg-contain bg-fixed bg-repeat">
      <div className="backdrop-brightness-50 w-full h-full absolute"></div>
      <section className="relative mx-auto flex h-svh w-full flex-col items-center justify-center overflow-hidden max-w-xl backdrop-brightness-200">
        <Messages />
        {/* <div className="w-full overflow-scroll">
          <pre className="text-background">{JSON.stringify(data, null, 4)}</pre>
        </div> */}

        <div className="w-full max-w-xl">
          {session ? (
            <AddChatForm />
          ) : (
            <div className="px-2 py-2">
              <Button
                className="h-10 w-full cursor-pointer gap-2 rounded-md border border-neutral-700 bg-white/75 whitespace-nowrap text-foreground backdrop-blur-sm transition-all hover:bg-white/10 hover:text-background hover:shadow-lg md:h-14 md:text-lg [&_svg]:shrink-0"
                onClick={() =>
                  signIn.social({
                    provider: "github",
                    callbackURL: "/chat",
                  })
                }
              >
                Continue with
                <SimpleIconsGoolge />
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
