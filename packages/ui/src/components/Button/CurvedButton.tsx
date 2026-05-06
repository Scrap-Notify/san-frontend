import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonTone = 'primary' | 'subtle' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface CurvedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  tone?: ButtonTone;
  size?: ButtonSize;
}

const buttonToneStyles: Record<ButtonTone, string> = {
  primary:
    'bg-gradient-to-r from-[#00ffc2] to-[#00e1ab] !text-black shadow-[0_20px_40px_rgba(0,255,194,0.2)] hover:opacity-95 active:shadow-[0_10px_24px_rgba(0,255,194,0.16)]',

  subtle:
    'border border-[#00ffc2]/20 bg-[#00ffc2]/10 text-[#00ffc2] shadow-[0_0_10px_rgba(0,255,194,0.12)] hover:bg-[#00ffc2]/15',

  ghost:
    'text-[#b9cbc1] hover:bg-white/5',
};

const buttonSizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-3 text-sm',
  lg: 'px-6 py-4 text-lg',
};

export function CurvedButton({
  children,
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  tone = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  disabled,
  ...props
}: CurvedButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 whitespace-nowrap',
        'rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px]',
        'font-bold leading-none',
        'transition-all duration-150 ease-out',
        'active:translate-y-px active:scale-[0.99]',
        'disabled:cursor-not-allowed disabled:opacity-60',
        fullWidth ? 'w-full' : 'w-fit',
        buttonToneStyles[tone],
        buttonSizeStyles[size],
        className,
      ].join(' ')}
      {...props}
    >
      {leadingIcon && (
        <span className="flex shrink-0 items-center justify-center">
          {leadingIcon}
        </span>
      )}

      <span className="block whitespace-nowrap">{children}</span>

      {trailingIcon && (
        <span className="flex shrink-0 items-center justify-center">
          {trailingIcon}
        </span>
      )}
    </button>
  );
}