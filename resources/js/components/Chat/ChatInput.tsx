import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Square } from 'lucide-react';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    onCancel?: () => void;
}

const MAX_HEIGHT = 200;

export function ChatInput({ onSend, disabled = false, onCancel }: ChatInputProps) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea up to MAX_HEIGHT
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
    }, [message]);

    const handleSend = () => {
        const trimmed = message.trim();
        if (trimmed && !disabled) {
            onSend(trimmed);
            setMessage('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Enter to send, Shift+Enter for new line
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t bg-background p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-end gap-2 rounded-xl border border-border/60 bg-card shadow-sm transition-all focus-within:border-primary/50 focus-within:shadow-md p-2">
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        disabled={disabled}
                        rows={1}
                        className="min-h-[40px] max-h-[200px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                    />
                    {onCancel ? (
                        <Button
                            onClick={onCancel}
                            variant="destructive"
                            size="icon"
                            className="shrink-0 h-9 w-9 rounded-lg"
                        >
                            <Square className="h-4 w-4" />
                            <span className="sr-only">Cancel</span>
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSend}
                            disabled={disabled || !message.trim()}
                            size="icon"
                            className="shrink-0 h-9 w-9 rounded-lg transition-transform hover:scale-105 active:scale-95"
                        >
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send message</span>
                        </Button>
                    )}
                </div>
                <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px] font-medium">Enter</kbd>
                        <span>to send</span>
                        <span className="opacity-50">·</span>
                        <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px] font-medium">Shift+Enter</kbd>
                        <span>for new line</span>
                    </div>
                    {message.length > 0 && (
                        <span className="tabular-nums opacity-70">{message.length}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
