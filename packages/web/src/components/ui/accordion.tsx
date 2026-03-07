import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type AccordionContextType = {
  value: string | undefined
  onValueChange: (value: string | undefined) => void
}

const AccordionContext = React.createContext<AccordionContextType | undefined>(undefined)

function useAccordion() {
  const context = React.useContext(AccordionContext)
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion")
  }
  return context
}

interface AccordionProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string | undefined) => void
  children: React.ReactNode
  className?: string
}

function Accordion({
  value: controlledValue,
  defaultValue,
  onValueChange,
  children,
  className,
}: AccordionProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | undefined>(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue

  const handleValueChange = React.useCallback((newValue: string | undefined) => {
    if (!isControlled) {
      setUncontrolledValue(newValue)
    }
    onValueChange?.(newValue)
  }, [isControlled, onValueChange])

  return (
    <AccordionContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)} data-orientation="vertical">
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

function AccordionItem({ value, children, className }: AccordionItemProps) {
  const { value: selectedValue } = useAccordion()
  const isOpen = selectedValue === value

  return (
    <div
      data-state={isOpen ? "open" : "closed"}
      data-orientation="vertical"
      className={cn("border-b", className)}
    >
      {children}
    </div>
  )
}

interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
}

function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  const { value, onValueChange } = useAccordion()
  const itemValue = React.useContext(AccordionItemValueContext)
  const isOpen = value === itemValue

  return (
    <button
      type="button"
      onClick={() => onValueChange(isOpen ? undefined : itemValue)}
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
        className
      )}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  )
}

const AccordionItemValueContext = React.createContext<string | undefined>(undefined)

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
}

function AccordionContent({ children, className }: AccordionContentProps) {
  const { value } = useAccordion()
  const itemValue = React.useContext(AccordionItemValueContext)
  const isOpen = value === itemValue

  if (!isOpen) return null

  return (
    <div
      data-state={isOpen ? "open" : "closed"}
      className={cn("overflow-hidden text-sm animate-accordion-down", className)}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  )
}

// Wrapper to provide item value context
function AccordionItemWrapper({ value, children, className }: AccordionItemProps) {
  return (
    <AccordionItemValueContext.Provider value={value}>
      <AccordionItem value={value} className={className}>
        {children}
      </AccordionItem>
    </AccordionItemValueContext.Provider>
  )
}

export {
  Accordion,
  AccordionItemWrapper as AccordionItem,
  AccordionTrigger,
  AccordionContent,
}
