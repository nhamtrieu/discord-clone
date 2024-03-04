"use client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useModal } from "@/hooks/use-modal-store";
import { ServerWithMembersWithProfiles } from "@/type";
import { MemberRole } from "@prisma/client";
import axios from "axios";
import {
    Check,
    Gavel,
    Loader2,
    MoreVertical,
    Shield,
    ShieldAlert,
    ShieldCheck,
    ShieldQuestion,
} from "lucide-react";
import { useRouter } from "next/navigation";
import qs from "query-string";
import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { UserAvatar } from "../user-avatar";

const roleIconMap = {
    GUEST: null,
    MODERATOR: <ShieldCheck className=" w-4 h-4 ml-2 text-indigo-500" />,
    ADMIN: <ShieldAlert className=" w-4 h-4 ml-2 text-rose-500" />,
};

export const MemberModal = () => {
    const router = useRouter();
    const { isOpen, onClose, type, data, onOpen } = useModal();
    const [loadingId, setLoadingId] = useState("");

    const isModalOpen = isOpen && type === "members";
    const { server } = data as { server: ServerWithMembersWithProfiles };

    const onKick = async (memberId: string) => {
        try {
            setLoadingId(memberId);
            const url = qs.stringifyUrl({
                url: `/api/members/${memberId}`,
                query: {
                    serverId: server?.id,
                },
            });

            const res = await axios.delete(url);
            router.refresh();
            onOpen("members", { server: res.data });
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingId("");
        }
    };

    const onRoleChange = async (role: MemberRole, memberId: string) => {
        try {
            setLoadingId(memberId);
            const url = qs.stringifyUrl({
                url: `/api/members/${memberId}`,
                query: {
                    serverId: server?.id,
                },
            });

            const response = await axios.patch(url, { role });
            router.refresh();
            onOpen("members", { server: response.data });
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingId("");
        }
    };
    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black overflow-hidden">
                <DialogHeader className=" pt-8 px-6">
                    <DialogTitle className=" text-2xl text-center font-bold">
                        Manage Members
                    </DialogTitle>
                    <DialogDescription className=" text-center text-zinc-500">
                        {server?.members?.length > 1
                            ? `${server?.members?.length} Member`
                            : `${server?.members?.length} Members`}
                    </DialogDescription>
                </DialogHeader>
                <div className="p-6">
                    <ScrollArea className=" mt-8 max-h-[420px] pr-6">
                        {server?.members?.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center gap-x-2 mb-6"
                            >
                                <UserAvatar
                                    src={member.profile.imageUrl}
                                    className=""
                                />
                                <div className="flex flex-col gap-y-1">
                                    <div className="text-xs font-semibold flex items-center">
                                        {member.profile.name}
                                        {roleIconMap[member.role]}
                                    </div>
                                    <p className=" text-xs text-zinc-500">
                                        {member.profile.email}
                                    </p>
                                </div>
                                {server.profileId !== member.profileId &&
                                    loadingId !== member.id && (
                                        <div className=" ml-auto">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger>
                                                    <MoreVertical className="h-4 w-4 text-zinc-500" />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent side="bottom">
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger className="flex items-center">
                                                            <ShieldQuestion className=" w-4 h-4 mr-2" />
                                                            <span>Role</span>
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuPortal>
                                                            <DropdownMenuSubContent>
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        onRoleChange(
                                                                            "GUEST",
                                                                            member.id
                                                                        )
                                                                    }
                                                                >
                                                                    <Shield className="h-4 w-4 mr-2" />
                                                                    Guest
                                                                    {member.role ===
                                                                        "GUEST" && (
                                                                        <Check className=" ml-auto h-4 w-4" />
                                                                    )}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        onRoleChange(
                                                                            "MODERATOR",
                                                                            member.id
                                                                        )
                                                                    }
                                                                >
                                                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                                                    Moderator
                                                                    {member.role ===
                                                                        "MODERATOR" && (
                                                                        <Check className=" ml-auto h-4 w-4" />
                                                                    )}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuPortal>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            onKick(member.id)
                                                        }
                                                    >
                                                        <Gavel className=" mr-2 h-4 w-4" />
                                                        Kick
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )}
                                {loadingId === member.id && (
                                    <Loader2 className=" animate-spin text-zinc-500 ml-auto w-4 h-4" />
                                )}
                            </div>
                        ))}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
};
