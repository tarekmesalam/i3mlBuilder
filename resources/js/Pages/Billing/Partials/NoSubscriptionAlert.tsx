import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

export default function NoSubscriptionAlert() {
    const { t } = useTranslation();

    return (
        <Card className="overflow-hidden border-dashed bg-gradient-to-br from-primary/5 via-background to-background">
            <CardContent className="p-6 sm:p-10">
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                        <div className="relative p-4 bg-primary/10 rounded-full ring-1 ring-primary/20">
                            <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{t('No Active Subscription')}</h3>
                    <p className="text-muted-foreground max-w-md">
                        {t('Choose a plan to get started with building your projects.')}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
