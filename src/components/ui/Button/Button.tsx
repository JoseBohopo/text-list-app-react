import { forwardRef } from "react";
import styles from "./styles/Button.module.css";
import type { ButtonProps } from "./types/Button.types";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", circle = false, className = "", children, ...props },
    ref,
  ) => {
    const classes = [
      styles.btn,
      styles[variant],
      circle ? styles.circle : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
