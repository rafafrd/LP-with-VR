import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant =
  | "primary"
  | "primary-sm"
  | "secondary"
  | "secondary-sm"
  | "ghost"
  | "ghost-sm"
  | "glass"
  | "pill";

type BaseProps = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
};

type AnchorProps = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    onClick?: () => void;
  };

type NativeButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
    onClick?: () => void;
  };

export type ButtonProps = AnchorProps | NativeButtonProps;

export default function Button({
  variant = "primary",
  children,
  className = "",
  icon,
  ...rest
}: ButtonProps) {
  const classes = `btn btn--${variant} ${className}`.trim();

  if ("href" in rest && rest.href) {
    return (
      <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {icon && <span className="btn__icon" aria-hidden="true">{icon}</span>}
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {icon && <span className="btn__icon" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
