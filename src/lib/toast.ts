import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
};

export function toast({ title, description, variant = "default" }: ToastProps) {
  const baseToast = title
    ? variant === "destructive"
      ? sonnerToast.error
      : variant === "success"
      ? sonnerToast.success
      : sonnerToast
    : sonnerToast;

  if (title && description) {
    baseToast(title, {
      description,
    });
  } else if (title) {
    baseToast(title);
  } else if (description) {
    sonnerToast(description);
  }
}
