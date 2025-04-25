import type React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EnhancedCarouselPrevious({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={`absolute left-2 top-1/2 z-20 h-12 w-12 -translate-y-1/2 rounded-full opacity-70 hover:opacity-100 ${className}`}
      {...props}
    >
      <ChevronLeft className="h-6 w-6" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

export function EnhancedCarouselNext({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={`absolute right-2 top-1/2 z-20 h-12 w-12 -translate-y-1/2 rounded-full opacity-70 hover:opacity-100 ${className}`}
      {...props}
    >
      <ChevronRight className="h-6 w-6" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}
