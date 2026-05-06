import { forwardRef, useCallback, useEffect } from "react";
import { type VariantProps } from "class-variance-authority";
import { Loader2, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth.ts";
import { Button, buttonVariants } from "@/components/ui/button.tsx";

export interface SignInButtonProps
  extends Omit<React.ComponentProps<"button">, "onClick">,
    VariantProps<typeof buttonVariants> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  showIcon?: boolean;
  signInText?: string;
  signOutText?: string;
  loadingText?: string;
  asChild?: boolean;
}

export const SignInButton = forwardRef<HTMLButtonElement, SignInButtonProps>(
  (
    {
      onClick,
      disabled,
      showIcon = true,
      signInText = "Ingresar con Google",
      signOutText = "Cerrar sesión",
      loadingText,
      className,
      variant,
      size,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const { isAuthenticated, signinRedirect, removeUser, isLoading, error } =
      useAuth();

    useEffect(() => {
      if (error) {
        toast.error("Error de autenticación", {
          description: error.message,
        });
        console.error("Authentication error:", error);
      }
    }, [error]);

    const handleClick = useCallback(
      async (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);

        try {
          if (isAuthenticated) {
            await removeUser();
          } else {
            await signinRedirect();
          }
        } catch (err) {
          console.error("Authentication error:", err);
          toast.error("No se pudo completar la autenticación");
        }
      },
      [isAuthenticated, removeUser, signinRedirect, onClick],
    );

    const isDisabled = disabled || isLoading;

    const defaultLoadingText = isAuthenticated
      ? "Cerrando sesión..."
      : "Iniciando sesión...";

    const currentLoadingText = loadingText || defaultLoadingText;

    const buttonText = isLoading
      ? currentLoadingText
      : isAuthenticated
        ? signOutText
        : signInText;

    const icon = isLoading ? (
      <Loader2 className="size-4 animate-spin" />
    ) : isAuthenticated ? (
      <LogOut className="size-4" />
    ) : (
      <LogIn className="size-4" />
    );

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        disabled={isDisabled}
        variant={variant}
        size={size}
        className={className}
        asChild={asChild}
        aria-label={
          isAuthenticated ? "Cerrar sesión de la cuenta" : "Iniciar sesión con Google"
        }
        aria-describedby={error ? "auth-error" : undefined}
        {...props}
      >
        {showIcon && icon}
        {buttonText}
      </Button>
    );
  },
);

SignInButton.displayName = "SignInButton";