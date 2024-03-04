import { useEffect, useState } from "react";

type ChatScrollProps = {
    chatRef: React.RefObject<HTMLDivElement>;
    bottomRef: React.RefObject<HTMLDivElement>;
    shouldLoadMore: boolean;
    loadMore: () => void;
    count: number;
};

export const useChatScroll = ({
    chatRef,
    bottomRef,
    shouldLoadMore,
    loadMore,
    count,
}: ChatScrollProps) => {
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        const topDip = chatRef?.current;

        const handleScroll = () => {
            const scrollTop = topDip?.scrollTop;

            if (scrollTop === 0 && shouldLoadMore) {
                loadMore();
            }
        };
        topDip?.addEventListener("scroll", handleScroll);
        return () => topDip?.removeEventListener("scroll", handleScroll);
    }, [shouldLoadMore, loadMore, chatRef]);

    useEffect(() => {
        const bottomDiv = bottomRef?.current;
        const topDiv = chatRef?.current;

        const shouldAutoScroll = () => {
            if (!hasInitialized && bottomDiv) {
                setHasInitialized(true);
                return true;
            }
            if (!topDiv) {
                return false;
            }

            const distanceFromBottom =
                topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;

            return distanceFromBottom < 100;
        };

        if (shouldAutoScroll()) {
            setTimeout(() => {
                bottomRef.current?.scrollIntoView({
                    behavior: "smooth",
                });
            }, 100);
        }
    }, [bottomRef, chatRef, count, hasInitialized]);
};
