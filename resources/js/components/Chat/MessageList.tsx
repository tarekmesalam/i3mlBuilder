import { useEffect, useRef, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatMessage } from '@/types/chat';
import { Sparkles, Lightbulb, ArrowRight } from 'lucide-react';

interface MessageListProps {
    messages: ChatMessage[];
    thinkingDuration?: number | null;
    suggestedPrompts?: string[];
    onSelectPrompt?: (prompt: string) => void;
}


const DEFAULT_PROMPTS = [
    'Build a modern landing page for a SaaS product',
    'Add a pricing section with three tiers',
    'Create a contact form with validation',
    'Make the hero section more visually striking',
];

export function MessageList({ messages, thinkingDuration, suggestedPrompts, onSelectPrompt }: MessageListProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const isNearBottomRef = useRef(true);

    // Check if user is near bottom (within 100px)
    const checkIfNearBottom = useCallback(() => {
        if (containerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
        }
    }, []);

    // Auto-scroll to bottom only if user is near bottom
    useEffect(() => {
        if (containerRef.current && isNearBottomRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);

    if (messages.length === 0) {
        const prompts = suggestedPrompts && suggestedPrompts.length > 0 ? suggestedPrompts : DEFAULT_PROMPTS;
        return (
            <div className="flex-1 flex items-center justify-center h-full px-4">
                <div className="text-center max-w-md w-full animate-slide-up">
                    <div className="h-14 w-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-sm">
                        <Sparkles className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                        What should we build today?
                    </h3>
                    <p className="text-sm text-muted-foreground mb-5">
                        Describe your idea or pick a starting point below.
                    </p>
                    {onSelectPrompt && (
                        <div className="grid gap-2 text-start">
                            {prompts.slice(0, 4).map((prompt, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => onSelectPrompt(prompt)}
                                    className="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-border/60 bg-card hover:bg-accent hover:border-primary/40 transition-all text-sm text-foreground shadow-sm hover:shadow"
                                >
                                    <span className="truncate">{prompt}</span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Filter messages to show user, assistant, and activity types
    const filteredMessages = messages.filter(
        msg => msg.type === 'user' || msg.type === 'assistant' || msg.type === 'activity'
    );

    return (
        <div ref={containerRef} className="flex-1 px-4 overflow-y-auto h-full" onScroll={checkIfNearBottom}>
            <div className="py-4 space-y-4">
                {filteredMessages.map((message, index) => {
                    // Show thinking duration from message data (persisted), or from live prop for last message
                    const showThinkingDuration =
                        message.type === 'assistant' &&
                        (message.thinkingDuration != null ||
                            (index === filteredMessages.length - 1 && thinkingDuration !== null));

                    const displayDuration = message.thinkingDuration ?? thinkingDuration;

                    return (
                        <div key={message.id}>
                            {showThinkingDuration && displayDuration != null && (
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                                    <Lightbulb className="w-4 h-4" />
                                    <span>Thought for {displayDuration}s</span>
                                </div>
                            )}
                            <MessageBubble message={message} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
