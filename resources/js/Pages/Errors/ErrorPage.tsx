import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/LanguageContext';
import { ArrowLeft, Home, RefreshCw, Compass, ServerCrash, ShieldAlert, Wrench } from 'lucide-react';
import type { PageProps } from '@/types';

interface ErrorPageProps extends PageProps {
    status: number;
    message?: string;
}

const META: Record<number, { titleKey: string; descKey: string; icon: React.ComponentType<{ className?: string }> }> = {
    404: { titleKey: 'Page not found', descKey: "The page you're looking for doesn't exist or has been moved.", icon: Compass },
    403: { titleKey: 'Access denied', descKey: "You don't have permission to access this page.", icon: ShieldAlert },
    419: { titleKey: 'Page expired', descKey: 'Please refresh the page and try again.', icon: RefreshCw },
    500: { titleKey: 'Server error', descKey: 'Something went wrong on our end. Please try again.', icon: ServerCrash },
    503: { titleKey: 'Service unavailable', descKey: "We're performing maintenance. Please check back soon.", icon: Wrench },
};

export default function ErrorPage({ status, message }: ErrorPageProps) {
    const { t } = useTranslation();
    const meta = META[status] ?? META[500];
    const Icon = meta.icon;

    return (
        <>
            <Head title={`${status} — ${t(meta.titleKey)}`} />

            <div className="relative min-h-screen overflow-hidden bg-background flex items-center justify-center px-4">
                {/* Decorative background */}
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
                    <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                            backgroundSize: '32px 32px',
                        }}
                    />
                </div>

                <div className="relative w-full max-w-lg text-center animate-in fade-in zoom-in-95 duration-500">
                    {/* Status badge */}
                    <div className="relative inline-flex items-center justify-center mb-8">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                        <div className="relative flex items-center justify-center h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/20 shadow-lg">
                            <Icon className="h-10 w-10 text-primary" />
                        </div>
                    </div>

                    {/* Status code — huge, gradient */}
                    <div className="mb-2">
                        <span className="inline-block text-7xl sm:text-8xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/40">
                            {status}
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
                        {t(meta.titleKey)}
                    </h1>
                    <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto">
                        {message || t(meta.descKey)}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button asChild size="lg" className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow">
                            <Link href="/">
                                <Home className="h-4 w-4 me-2" />
                                {t('Back to home')}
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto"
                        >
                            <ArrowLeft className="h-4 w-4 me-2 rtl:rotate-180" />
                            {t('Go back')}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
