import { useState } from 'react';
import { ExternalLink, FileText, Link as LinkIcon, Copy, Check } from 'lucide-react';

export interface CollectedDataItem {
    id: string;
    type: 'text' | 'image' | 'link';
    title: string;
    subtitle?: string;
    timeLabel?: string;
    excerpt?: string;
    tag?: string;
    imageUrl?: string;
    href?: string;
}

export function CollectedDataCard({ item }: { item: CollectedDataItem }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!item.excerpt) return;

        navigator.clipboard.writeText(item.excerpt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const leafBaseClass =
        'group relative flex-shrink-0 overflow-hidden border border-white/5 bg-[#1A1C1E] shadow-xl transition-all hover:scale-[1.01] hover:bg-[#222426] rounded-tl-[32px] rounded-br-[32px] rounded-tr-lg rounded-bl-lg w-full';

    const cardContent = (
        <>
            {item.type === 'image' ? (
                <article className={leafBaseClass}>
                    <div className="relative h-48 w-full">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-surface-lowest">
                                <div className="h-full w-full bg-gradient-to-br from-primary-signal/20 to-black/40" />
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="text-base font-bold leading-tight text-white">{item.title}</h3>
                            <p className="mt-1 text-xs font-medium text-text-secondary/80">
                                {item.subtitle || 'Captured from Source'}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleCopy}
                            className="absolute right-4 top-4 rounded-xl bg-black/40 p-2 text-white/70 backdrop-blur-md transition hover:bg-black/60 hover:text-primary-signal"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>
                </article>
            ) : item.type === 'link' ? (
                <article className={`flex flex-col gap-4 p-6 ${leafBaseClass}`}>
                    <header className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="shrink-0">
                                <LinkIcon size={22} className="text-primary-signal" />
                            </div>
                            <h3 className="text-base font-bold leading-tight text-white">{item.title}</h3>
                        </div>

                        <button
                            type="button"
                            onClick={handleCopy}
                            className="rounded-xl bg-white/5 p-2 text-text-secondary transition hover:bg-white/10 hover:text-primary-signal"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </header>

                    {item.excerpt ? (
                        <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary/60">
                            {item.excerpt}
                        </p>
                    ) : null}
                </article>
            ) : (
                <article className={`flex flex-col gap-4 p-6 ${leafBaseClass}`}>
                    <header className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="shrink-0 pt-0.5">
                                <FileText size={24} className="text-primary-signal" />
                            </div>

                            <div className="min-w-0 flex-1 pt-1">
                                <h3 className="text-base font-bold leading-tight text-white">{item.title}</h3>
                                <p className="mt-0.5 text-xs font-medium text-text-secondary/40">
                                    {item.timeLabel}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleCopy}
                            className="rounded-xl bg-white/5 p-2 text-text-secondary transition hover:bg-white/10 hover:text-primary-signal"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </header>

                    {item.excerpt ? (
                        <p className="line-clamp-3 select-text text-base italic leading-relaxed text-text-secondary/80">
                            "{item.excerpt}"
                        </p>
                    ) : null}

                    <footer className="mt-1 flex items-center justify-between border-t border-white/5 pt-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary/50">
              {item.tag}
            </span>

                        {item.href ? (
                            <div className="rounded-lg bg-white/5 p-1.5 transition hover:bg-primary-signal/10">
                                <ExternalLink
                                    size={16}
                                    className="text-text-secondary/80 group-hover:text-primary-signal"
                                />
                            </div>
                        ) : null}
                    </footer>
                </article>
            )}
        </>
    );

    if (!item.href) return cardContent;

    return (
        <a href={item.href} target="_blank" rel="noreferrer" className="block">
            {cardContent}
        </a>
    );
}