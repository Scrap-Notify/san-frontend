import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface CurvedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  tone?: 'primary' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
}

const baseClassName = [
  'inline-flex flex-nowrap items-center justify-center gap-2.5 whitespace-nowrap',
  'rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px]',
  'font-black leading-none',
  'transition-transform transition-shadow duration-150 ease-out',
  'active:translate-y-px active:scale-[0.99]',
  'disabled:cursor-not-allowed disabled:opacity-60',
].join(' ');

const toneClassMap: Record<NonNullable<CurvedButtonProps['tone']>, string> = {
  primary: [
    'bg-[#00ffc2]',
    'text-[var(--color-text-primary)]',
    'shadow-[0_0_25px_rgba(0,255,194,0.3)]',
    'hover:opacity-95',
    'active:shadow-[0_0_12px_rgba(0,255,194,0.22)]',
  ].join(' '),
  subtle: [
    'border border-[#00ffc2]/20 bg-[#00ffc2]/10',
    'text-[var(--color-text-secondary)]',
    'shadow-[0_0_10px_rgba(0,255,194,0.12)]',
    'hover:bg-[#00ffc2]/15',
    'active:shadow-[0_0_6px_rgba(0,255,194,0.1)]',
  ].join(' '),
};

const sizeClassMap: Record<NonNullable<CurvedButtonProps['size']>, string> = {
  sm: 'min-h-9 px-4 py-2 text-xs',
  md: 'min-h-11 px-6 py-3 text-sm',
  lg: 'min-h-12 px-8 py-3.5 text-base',
};

export function CurvedButton({
  children,
  leadingIcon,
  trailingIcon,
  className,
  fullWidth = false,
  tone = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: CurvedButtonProps) {
  return (
    <button
      type={type}
      className={[
        baseClassName,
        toneClassMap[tone],
        sizeClassMap[size],
        fullWidth ? 'w-full' : '',
        className ?? '',
      ].join(' ')}
      {...props}
    >
      {leadingIcon ? <span className="shrink-0">{leadingIcon}</span> : null}
      <span className="block whitespace-nowrap">{children}</span>
      {trailingIcon ? <span className="shrink-0">{trailingIcon}</span> : null}
    </button>
  );
}
