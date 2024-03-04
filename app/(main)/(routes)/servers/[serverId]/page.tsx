import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface ServerPageIdProps {
    params: {
        serverId: string;
    };
}

export default async function ServerPageId({ params }: ServerPageIdProps) {
    const profile = await currentProfile();

    if (!profile) {
        return redirectToSignIn();
    }

    const server = await db.server.findUnique({
        where: {
            id: params.serverId,
            members: {
                some: {
                    profileId: profile.id,
                },
            },
        },
        include: {
            chanels: {
                where: {
                    name: "general",
                },
                orderBy: {
                    createdAt: "asc",
                },
            },
        },
    });

    const initialChannel = server?.chanels[0];

    if (initialChannel?.name !== "general") {
        return null;
    }

    return redirect(
        `/servers/${params.serverId}/channels/${initialChannel?.id}`
    );
}
