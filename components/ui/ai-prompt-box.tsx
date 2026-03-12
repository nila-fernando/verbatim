"use client";

import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ArrowUp, Paperclip, X } from "lucide-react";
import { motion } from "framer-motion";

const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

// SSR-safe style injection
if (typeof document !== "undefined") {
  const id = "ai-prompt-box-styles";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      textarea::-webkit-scrollbar { width: 6px; }
      textarea::-webkit-scrollbar-track { background: transparent; }
      textarea::-webkit-scrollbar-thumb { background-color: #444444; border-radius: 3px; }
      textarea::-webkit-scrollbar-thumb:hover { background-color: #555555; }
    `;
    document.head.appendChild(style);
  }
}

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex w-full rounded-md border-none bg-transparent px-3 py-2.5 text-base text-gray-100 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] resize-none",
        className
      )}
      ref={ref}
      rows={1}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

// Tooltip
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border border-[#333333] bg-[#1F2023] px-3 py-1.5 text-sm text-white shadow-md animate-in fade-in-0 zoom-in-95",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// PromptInput context
interface PromptInputContextType {
  isLoading: boolean;
  value: string;
  setValue: (value: string) => void;
  maxHeight: number | string;
  onSubmit?: () => void;
  disabled?: boolean;
}
const PromptInputContext = React.createContext<PromptInputContextType>({
  isLoading: false,
  value: "",
  setValue: () => {},
  maxHeight: 240,
  onSubmit: undefined,
  disabled: false,
});
function usePromptInput() {
  return React.useContext(PromptInputContext);
}

// PromptInput wrapper
interface PromptInputProps {
  isLoading?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  maxHeight?: number | string;
  onSubmit?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}
const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  (
    {
      className,
      isLoading = false,
      maxHeight = 240,
      value,
      onValueChange,
      onSubmit,
      children,
      disabled = false,
      onDragOver,
      onDragLeave,
      onDrop,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(value || "");
    const handleChange = (newValue: string) => {
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };
    return (
      <TooltipProvider>
        <PromptInputContext.Provider
          value={{
            isLoading,
            value: value ?? internalValue,
            setValue: onValueChange ?? handleChange,
            maxHeight,
            onSubmit,
            disabled,
          }}
        >
          <div
            ref={ref}
            className={cn(
              "rounded-3xl border border-[#444444] bg-[#1F2023] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300",
              isLoading && "border-red-500/70",
              className
            )}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {children}
          </div>
        </PromptInputContext.Provider>
      </TooltipProvider>
    );
  }
);
PromptInput.displayName = "PromptInput";

// Auto-sizing textarea
interface PromptInputTextareaProps {
  disableAutosize?: boolean;
  placeholder?: string;
}
const PromptInputTextarea: React.FC<
  PromptInputTextareaProps & React.ComponentProps<typeof Textarea>
> = ({ className, onKeyDown, disableAutosize = false, placeholder, ...props }) => {
  const { value, setValue, maxHeight, onSubmit, disabled } = usePromptInput();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (disableAutosize || !textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      typeof maxHeight === "number"
        ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
        : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`;
  }, [value, maxHeight, disableAutosize]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit?.();
    }
    onKeyDown?.(e);
  };

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      className={cn("text-base", className)}
      disabled={disabled}
      placeholder={placeholder}
      {...props}
    />
  );
};

// Actions bar
const PromptInputActions: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn("flex items-center gap-2", className)} {...props}>
    {children}
  </div>
);

// Single action with tooltip
interface PromptInputActionProps {
  tooltip: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}
const PromptInputAction: React.FC<PromptInputActionProps> = ({
  tooltip,
  children,
  className,
  side = "top",
}) => {
  const { disabled } = usePromptInput();
  return (
    <Tooltip>
      <TooltipTrigger asChild disabled={disabled}>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} className={className}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
};

// Main exported component
interface PromptInputBoxProps {
  onSend?: (message: string, files?: File[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}
export const PromptInputBox = React.forwardRef<HTMLDivElement, PromptInputBoxProps>(
  (props, ref) => {
    const {
      onSend = () => {},
      isLoading = false,
      placeholder = "ask about your documents...",
      className,
    } = props;
    const [input, setInput] = React.useState("");
    const [files, setFiles] = React.useState<File[]>([]);
    const [filePreviews, setFilePreviews] = React.useState<Record<string, string>>({});
    const uploadInputRef = React.useRef<HTMLInputElement>(null);
    const promptBoxRef = React.useRef<HTMLDivElement>(null);

    const processFile = (file: File) => {
      if (file.size > 10 * 1024 * 1024) return;
      setFiles([file]);
      const reader = new FileReader();
      reader.onload = (e) =>
        setFilePreviews({ [file.name]: e.target?.result as string });
      reader.readAsDataURL(file);
    };

    const handleRemoveFile = () => {
      setFiles([]);
      setFilePreviews({});
    };

    const handleDragOver = React.useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleDragLeave = React.useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleDrop = React.useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const dropped = Array.from(e.dataTransfer.files);
        if (dropped.length > 0) processFile(dropped[0]);
      },
      []
    );

    const handleSubmit = () => {
      if (input.trim() || files.length > 0) {
        onSend(input, files);
        setInput("");
        setFiles([]);
        setFilePreviews({});
      }
    };

    const hasContent = input.trim() !== "" || files.length > 0;

    return (
      <PromptInput
        value={input}
        onValueChange={setInput}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        className={cn(
          "w-full bg-[#1F2023] border-[#444444] shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300 ease-in-out",
          className
        )}
        disabled={isLoading}
        ref={ref || promptBoxRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* File preview */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-1">
            {files.map((file, index) => (
              <div key={index} className="relative">
                {file.type.startsWith("image/") && filePreviews[file.name] ? (
                  <div className="h-16 w-16 overflow-hidden rounded-xl">
                    <img
                      src={filePreviews[file.name]}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={handleRemoveFile}
                      className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-gray-300">
                    <span className="max-w-[120px] truncate">{file.name}</span>
                    <button onClick={handleRemoveFile}>
                      <X className="h-3 w-3 text-gray-400" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <PromptInputTextarea placeholder={placeholder} className="text-base" />

        <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-1">
            <PromptInputAction tooltip="Attach file">
              <button
                onClick={() => uploadInputRef.current?.click()}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#9CA3AF] transition-colors hover:bg-gray-600/30 hover:text-[#D1D5DB]"
              >
                <Paperclip className="h-5 w-5" />
                <input
                  ref={uploadInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) processFile(e.target.files[0]);
                    if (e.target) e.target.value = "";
                  }}
                />
              </button>
            </PromptInputAction>
          </div>

          <PromptInputAction
            tooltip={isLoading ? "Stop generation" : "Send message"}
          >
            <motion.button
              whileTap={{ scale: 0.92 }}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
                hasContent
                  ? "bg-white text-[#1F2023] hover:bg-white/80"
                  : "bg-transparent text-[#9CA3AF] hover:bg-gray-600/30 hover:text-[#D1D5DB]"
              )}
              onClick={handleSubmit}
              disabled={isLoading && !hasContent}
            >
              <ArrowUp className="h-4 w-4" />
            </motion.button>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>
    );
  }
);
PromptInputBox.displayName = "PromptInputBox";
