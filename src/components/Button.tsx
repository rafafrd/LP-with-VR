import type { AnchorHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "ghost-sm";

type ButtonProps = {
  variant?: Variant;
  href: string;
  children: ReactNode;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

export default function Button({
  variant = "primary",
  href,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <a href={href} className={`btn btn--${variant}${className ? ` ${className}` : ""}`} {...rest}>
      {children}
    </a>
  );
}
