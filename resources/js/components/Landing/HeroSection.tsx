import { useState, useEffect, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GradientBackground } from '@/components/Dashboard/GradientBackground';
import { ArrowRight, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { useScramble } from 'use-scramble';
import { TrustedBy } from './TrustedBy';
import { useTranslation } from '@/contexts/LanguageContext';
import axios from 'axios';

interface HeroSectionProps {
    auth: {
        user: { id: number; name: string; email: string } | null;
    };
    initialSuggestions: string[];
    initialTypingPrompts: string[];
    initialHeadline: string;
    initialSubtitle: string;
    isPusherConfigured?: boolean;
    canCreateProject?: boolean;
    cannotCreateReason?: string | null;
    content?: {
        headlines?: string[];
        subtitles?: string[];
        cta_button?: string;
    };
    trustedBy?: {
        enabled?: boolean;
        content?: Record<string, unknown>;
        items?: Array<Record<string, unknown>>;
    };
}

function useTypingAnimation(texts: string[], typingSpeed = 50, pauseDuration = 2000, deletingSpeed = 30) {
    const [displayText, setDisplayText] = useState('');
    const [textIndex, setTextIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    // Reset animation state when texts array changes (e.g., language switch)
    // Use JSON.stringify to compare by value, not reference
    const textsKey = JSON.stringify(texts);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting animation state machine on texts change
        setDisplayText('');
        setTextIndex(0);
        setIsTyping(true);
        setIsPaused(false);
    }, [textsKey]);

    useEffect(() => {
        if (texts.length === 0) return;

        const currentText = texts[textIndex];

        if (isPaused) {
            const pauseTimer = setTimeout(() => {
                setIsPaused(false);
                setIsTyping(false);
            }, pauseDuration);
            return () => clearTimeout(pauseTimer);
        }

        if (isTyping) {
            if (displayText.length < currentText.length) {
                const typingTimer = setTimeout(() => {
                    setDisplayText(currentText.slice(0, displayText.length + 1));
                }, typingSpeed);
                return () => clearTimeout(typingTimer);
            } else {
                // eslint-disable-next-line react-hooks/set-state-in-effect -- animation state machine transition
                setIsPaused(true);
            }
        } else {
            if (displayText.length > 0) {
                const deletingTimer = setTimeout(() => {
                    setDisplayText(displayText.slice(0, -1));
                }, deletingSpeed);
                return () => clearTimeout(deletingTimer);
            } else {
                setTextIndex((prev) => (prev + 1) % texts.length);
                setIsTyping(true);
            }
        }
    }, [displayText, isTyping, isPaused, textIndex, texts, typingSpeed, pauseDuration, deletingSpeed]);

    return displayText;
}

export function HeroSection({
    auth,
    initialSuggestions,
    initialTypingPrompts,
    initialHeadline,
    initialSubtitle,
    isPusherConfigured = true,
    canCreateProject = true,
    cannotCreateReason = null,
    trustedBy,
}: HeroSectionProps) {
    const { t, locale, isRtl } = useTranslation();
    const [prompt, setPrompt] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState(initialSuggestions);
    const [typingPrompts, setTypingPrompts] = useState(initialTypingPrompts);
    const [headline, setHeadline] = useState(initialHeadline);
    const [subtitle, setSubtitle] = useState(initialSubtitle);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isInitialMount = useRef(true);
    const prevLocale = useRef(locale);

    // Update state when props change (e.g., after language switch)
    useEffect(() => {
        setSuggestions(initialSuggestions);
        setTypingPrompts(initialTypingPrompts);
        if (initialHeadline !== headline) {
            setHeadline(initialHeadline);
        }
        if (initialSubtitle !== subtitle) {
            setSubtitle(initialSubtitle);
        }
    }, [initialSuggestions, initialTypingPrompts, initialHeadline, initialSubtitle, headline, subtitle]);

    // Compute disabled state for logged-in users
    const isDisabled = !!(auth.user && (!isPusherConfigured || !canCreateProject));

    // Scramble animation for headline
    const { ref: headlineRef, replay: replayScramble } = useScramble({
        text: headline,
        speed: 0.8,
        tick: 1,
        step: 1,
        scramble: 4,
        seed: 2,
    });

    const animatedPlaceholder = useTypingAnimation(typingPrompts);
    const showAnimatedPlaceholder = !prompt && !isFocused && !isDisabled;

    // Replay scramble animation on Inertia navigation (handles same-page navigation)
    useEffect(() => {
        const removeListener = router.on('finish', (event) => {
            if (event.detail.visit.url.pathname === '/') {
                replayScramble();
            }
        });

        return () => removeListener();
    }, [replayScramble]);

    // Replay scramble animation when locale changes (skip initial mount)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        // Only replay if locale actually changed
        if (prevLocale.current !== locale) {
            prevLocale.current = locale;
            replayScramble();
        }
    }, [locale, replayScramble]);

    // Fetch AI-powered content after page loads (only suggestions and typing prompts)
    useEffect(() => {
        const fetchAiContent = async () => {
            try {
                const response = await axios.get('/landing/ai-content');
                if (response.data) {
                    setSuggestions(response.data.suggestions || initialSuggestions);
                    setTypingPrompts(response.data.typingPrompts || initialTypingPrompts);
                }
            } catch {
                // Keep static content on error
            }
        };

        // Defer fetch to not block initial render
        const timeoutId = setTimeout(fetchAiContent, 100);
        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        if (!auth.user) {
            // Save prompt for post-registration retrieval
            sessionStorage.setItem('landing_prompt', prompt.trim());
            router.visit('/register');
        } else {
            router.post('/projects', { prompt: prompt.trim() });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        if (isDisabled) return;
        setPrompt(suggestion);
        textareaRef.current?.focus();
    };

    return (
        <section className="relative min-h-dvh flex flex-col items-center justify-center px-4 pt-20 pb-32 sm:pb-24 bg-background overflow-hidden">
            <GradientBackground />

            {/* Aurora grid glow background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Grid */}
                <div
                    className="absolute inset-0 opacity-60"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        WebkitMaskImage:
                            'radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%)',
                        maskImage:
                            'radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%)',
                    }}
                />
                {/* Aurora glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full mix-blend-screen blur-[140px] animate-pulse"
                    style={{ backgroundColor: 'color-mix(in oklab, var(--primary) 18%, transparent)' }}
                />
                <div className="absolute top-1/4 left-1/5 w-[420px] h-[420px] rounded-full mix-blend-screen blur-[120px]"
                    style={{ backgroundColor: 'color-mix(in oklab, var(--primary) 12%, transparent)' }}
                />
                <div className="absolute bottom-1/4 right-1/5 w-[420px] h-[420px] rounded-full mix-blend-screen blur-[120px]"
                    style={{ backgroundColor: 'color-mix(in oklab, var(--primary) 10%, transparent)' }}
                />
            </div>

            <div className="relative z-10 w-full max-w-4xl mx-auto text-center px-2 sm:px-0">
                {/* Eyebrow badge */}
                <div className="flex justify-center mb-6 sm:mb-8 animate-fade-in">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/25 bg-primary/5 text-primary text-xs sm:text-[13px] font-medium backdrop-blur-sm shadow-[0_0_15px_color-mix(in_oklab,var(--primary)_15%,transparent)]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                        </span>
                        <Sparkles className="h-3.5 w-3.5" />
                        {t('Powered by AI')}
                    </span>
                </div>

                {/* Headline with scramble animation + gradient */}
                <h1
                    ref={headlineRef}
                    className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tighter leading-[1.05] mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground via-foreground to-foreground/50"
                />

                {/* Subtitle */}
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                    {subtitle}
                </p>

                {/* Cannot create project warning (for logged-in users) */}
                {auth.user && !isPusherConfigured && (
                    <Alert variant="destructive" className="max-w-2xl mx-auto mb-4 text-left">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {t('Real-time features are not configured. Please contact support.')}
                        </AlertDescription>
                    </Alert>
                )}

                {auth.user && !canCreateProject && isPusherConfigured && (
                    <Alert variant="destructive" className="max-w-2xl mx-auto mb-4 text-left">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {cannotCreateReason}{' '}
                            <Link href="/billing/plans" className="underline font-semibold">
                                {t('View Plans')}
                            </Link>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Prompt Input */}
                <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit} className="relative group">
                        {/* Focus glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/25 via-primary/15 to-primary/25 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition duration-700 pointer-events-none" />

                        <div className="relative bg-card/50 backdrop-blur-2xl rounded-2xl border border-border/60 overflow-hidden shadow-2xl transition-all duration-300 group-focus-within:border-primary/40 group-focus-within:bg-card/70">
                            <div className="relative">
                                <textarea
                                    ref={textareaRef}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={!showAnimatedPlaceholder ? t('I want to build...') : ""}
                                    disabled={isDisabled}
                                    className="w-full px-4 sm:px-5 py-4 sm:py-5 text-base sm:text-lg resize-none focus:outline-none focus:ring-0 border-0 min-h-[100px] sm:min-h-[130px] bg-transparent relative z-10 text-start disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/60"
                                    rows={2}
                                />
                                {/* Animated placeholder overlay */}
                                {showAnimatedPlaceholder && (
                                    <div
                                        className="absolute inset-0 px-4 sm:px-5 py-4 sm:py-5 pointer-events-none text-muted-foreground/60 text-base sm:text-lg text-start"
                                        onClick={() => textareaRef.current?.focus()}
                                    >
                                        {animatedPlaceholder}
                                        <span className="inline-block w-0.5 h-5 bg-primary/60 ms-0.5 animate-pulse align-middle" />
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-2 px-4 py-3 bg-muted/30 border-t border-border/50">
                                {/* Keyboard hint */}
                                <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                    <kbd className="px-2 py-1 rounded bg-background/80 border border-border text-[10px] text-foreground/70">⌘</kbd>
                                    <kbd className="px-2 py-1 rounded bg-background/80 border border-border text-[10px] text-foreground/70">Enter</kbd>
                                    <span>{t('to start')}</span>
                                </div>
                                <div className="flex items-center gap-2 ms-auto">
                                    <Button
                                        type="submit"
                                        disabled={!prompt.trim() || isDisabled}
                                        className="shrink-0 h-10 min-w-[100px] rounded-xl font-bold transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_color-mix(in_oklab,var(--primary)_35%,transparent)] active:scale-95"
                                    >
                                        <span className="text-sm sm:text-base">
                                            {auth.user ? t('Start') : t('Go')}
                                        </span>
                                        {isRtl ? (
                                            <ArrowLeft className="h-4 w-4 me-1.5" />
                                        ) : (
                                            <ArrowRight className="h-4 w-4 ms-1.5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Suggestions - Marquee */}
                    <div className="mt-6 sm:mt-8 overflow-hidden max-w-2xl relative">
                        {/* Gradient fade on edges */}
                        <div className="absolute start-0 top-0 bottom-0 w-6 sm:w-10 md:w-12 bg-gradient-to-r rtl:bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
                        <div className="absolute end-0 top-0 bottom-0 w-6 sm:w-10 md:w-12 bg-gradient-to-l rtl:bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                        <div className={`flex gap-2 sm:gap-3 hover:[animation-play-state:paused] ${isRtl ? 'animate-marquee-rtl' : 'animate-marquee'}`}>
                            {/* Duplicate suggestions for seamless loop */}
                            {[...suggestions, ...suggestions].map((suggestion, index) => (
                                <button
                                    key={`${suggestion}-${index}`}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    disabled={isDisabled}
                                    className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-card/40 backdrop-blur-md hover:bg-primary/10 border border-border/50 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all shadow-sm whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card/40"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Trusted by at bottom of hero */}
            {trustedBy?.enabled !== false && (
                <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 z-10 px-4">
                    <TrustedBy
                        content={trustedBy?.content}
                        items={trustedBy?.items as Array<{ name: string; initial: string; color: string; image_url?: string | null }>}
                    />
                </div>
            )}
        </section>
    );
}
