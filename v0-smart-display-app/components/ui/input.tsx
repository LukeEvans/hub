import * as React from 'react'
import { useVirtualKeyboard } from "@/components/virtual-keyboard-context"
import { cn } from '@/lib/utils'

function Input({ className, type, id, onFocus, onBlur, ...props }: React.ComponentProps<'input'>) {
  const { registerInput, onFocus: onKeyboardFocus, onBlur: onKeyboardBlur } = useVirtualKeyboard()
  const generatedId = React.useId()
  const inputId = id || generatedId
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    registerInput(inputId, inputRef.current)
    return () => registerInput(inputId, null)
  }, [inputId, registerInput])

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    onKeyboardFocus(inputId)
    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onKeyboardBlur(inputId)
    onBlur?.(e)
  }

  return (
    <input
      id={inputId}
      ref={inputRef}
      type={type}
      data-slot="input"
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
