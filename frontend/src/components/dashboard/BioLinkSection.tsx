'use client';

import { useState } from 'react';
import { Link2, Copy, ExternalLink, Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useTranslation } from '@/lib/i18n';
import { SITE_URL } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface BioLinkSectionProps {
  slug: string;
}

export function BioLinkSection({ slug }: BioLinkSectionProps) {
  const { t, lang } = useTranslation();
  const [copied, setCopied] = useState(false);

  const storeUrl = `${SITE_URL}/store/${slug}`;
  const isRtl = lang === 'ar';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = storeUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.biolink_share_text,
          text: t.biolink_share_text,
          url: storeUrl,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="p-5 sm:p-6">
        <div className={cn('flex items-start gap-3 mb-4', isRtl && 'flex-row-reverse')}>
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Link2 className="w-5 h-5 text-primary" />
          </div>
          <div className={cn('flex-1 min-w-0', isRtl && 'text-right')}>
            <h3 className="font-semibold text-base">{t.biolink_title}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{t.biolink_url_label}</p>
          </div>
        </div>

        <div className={cn(
          'flex items-center gap-2 p-3 rounded-xl bg-background/80 border border-border/50 mb-3',
          isRtl && 'flex-row-reverse'
        )}>
          <span className="flex-1 min-w-0 text-sm font-mono truncate text-foreground">
            {storeUrl}
          </span>
        </div>

        <div className={cn('flex flex-wrap gap-2', isRtl && 'flex-row-reverse')}>
          <Button
            variant="gold"
            size="sm"
            onClick={handleCopy}
            className={cn('gap-1.5', copied && 'bg-green-600 hover:bg-green-600 text-white')}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? t.biolink_copied : t.biolink_copy}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(storeUrl, '_blank')}
            className="gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            {t.biolink_open_store}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            {t.biolink_share}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
          {t.biolink_instagram_hint}
        </p>
      </CardContent>
    </Card>
  );
}
