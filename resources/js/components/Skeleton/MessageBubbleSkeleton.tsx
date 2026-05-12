import { Skeleton } from '@/components/ui/skeleton';

interface MessageBubbleSkeletonProps {
    variant: 'user' | 'assistant';
    delay?: number;
}

export function MessageBubbleSkeleton({ variant, delay = 0 }: MessageBubbleSkeletonProps) {
    const isUser = variant === 'user';
    const style = { animationDelay: `${delay}ms` } as React.CSSProperties;

    if (isUser) {
        return (
            <div
                className="flex justify-end animate-fade-in"
                data-testid="user-message-skeleton"
                style={style}
            >
                <div className="max-w-[85%] space-y-2 flex flex-col items-end">
                    <Skeleton
                        className="h-8 w-56 rounded-2xl rounded-br-md"
                        data-testid="line-skeleton-1"
                    />
                    <Skeleton
                        className="h-4 w-32 rounded-2xl rounded-br-md"
                        data-testid="line-skeleton-2"
                    />
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex justify-start gap-3 animate-fade-in"
            data-testid="assistant-message-skeleton"
            style={style}
        >
            <Skeleton
                className="h-8 w-8 rounded-full shrink-0"
                data-testid="avatar-skeleton"
            />
            <div className="max-w-[85%] space-y-2 flex-1">
                <Skeleton
                    className="h-4 w-3/4 rounded-2xl rounded-bl-md"
                    data-testid="line-skeleton-1"
                />
                <Skeleton
                    className="h-4 w-1/2 rounded-2xl rounded-bl-md"
                    data-testid="line-skeleton-2"
                />
                <Skeleton
                    className="h-4 w-2/3 rounded-2xl rounded-bl-md"
                    data-testid="line-skeleton-3"
                />
            </div>
        </div>
    );
}
