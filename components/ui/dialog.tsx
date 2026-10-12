import * as React from "react";
import { cn } from "@/lib/utils";

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(
  undefined,
);

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({
  open: controlledOpen,
  onOpenChange,
  children,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const titleId = React.useId();

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [controlledOpen, onOpenChange],
  );

  return (
    <DialogContext.Provider
      value={{ open, onOpenChange: handleOpenChange, titleId }}
    >
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const context = React.useContext(DialogContext);
  if (!context) throw new Error("DialogTrigger must be used within Dialog");

  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        context.onOpenChange(true);
        onClick?.(e);
      }}
      {...props}
    />
  );
});
DialogTrigger.displayName = "DialogTrigger";

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, onClose, ...props }, ref) => {
    const context = React.useContext(DialogContext);
    const localRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => localRef.current!);
    React.useEffect(() => {
      if (!context?.open) return;
      const previous = document.activeElement as HTMLElement | null;
      const oldOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const focusables = () =>
        Array.from(
          localRef.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]',
          ) || [],
        );
      (focusables()[0] || localRef.current)?.focus();
      const onKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          context.onOpenChange(false);
        }
        if (event.key === "Tab") {
          const elements = focusables();
          const first = elements[0];
          const last = elements.at(-1);
          if (!first) {
            event.preventDefault();
            return;
          }
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      };
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = oldOverflow;
        previous?.focus();
      };
    }, [context?.open]);
    if (!context || !context.open) return null;

    return (
      <div
        className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={(event) => {
          if (event.target === event.currentTarget) context.onOpenChange(false);
        }}
      >
        <div
          ref={localRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={context.titleId}
          tabIndex={-1}
          className={cn(
            "relative w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  },
);
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-left mb-4", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t border-slate-100 mt-4",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const context = React.useContext(DialogContext);
  return (
    <h3
      ref={ref}
      id={context?.titleId}
      className={cn(
        "text-lg font-bold leading-none tracking-tight text-slate-900",
        className,
      )}
      {...props}
    />
  );
});
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-slate-500 leading-relaxed", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
