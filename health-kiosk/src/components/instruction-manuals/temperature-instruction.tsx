"use client"
import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"

const instructions = [
  {
    id: 1,
    image: "/instructions/ti/1.jpg",
  },
  {
    id: 2,
    image: "/instructions/ti/2.jpg",
  },
  {
    id: 3,
    image: "/instructions/ti/3.jpg",
  },
  {
    id: 4,
    image: "/instructions/ti/4.jpg",
  },
  {
    id: 5,
    image: "/instructions/ti/5.jpg",
  },
  {
    id: 6,
    image: "/instructions/ti/6.jpg",
  },
  {
    id: 7,
    image: "/instructions/ti/7.jpg",
  },
  {
    id: 8,
    image: "/instructions/ti/8.jpg",
  },
  {
    id: 9,
    image: "/instructions/ti/9.jpg",
  },
  {
    id: 10,
    image: "/instructions/ti/10.jpg",
  },
]

export default function TemperatureInstructionManual() {
  const [open, setOpen] = useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)

    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Temperature Instructions</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] xl:max-w-[900px] p-0 md:p-6">
        <DialogHeader>
          <DialogTitle>Temperature - Beurer Health Manager</DialogTitle>
          <DialogDescription>
            Follow these instructions to properly use your device with the Beurer app for temperature monitoring.
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full overflow-hidden">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {instructions.map((step) => (
                <div key={step.id} className="flex-[0_0_100%] min-w-0">
                  <Card>
                    <CardContent className="p-0">
                      <div
                        className="relative overflow-hidden rounded-t-lg"
                        style={{ height: "400px", maxHeight: "60vh" }}
                      >
                        <Image
                          src={step.image || "/placeholder.svg"}
                          alt={`Step ${step.id}`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                          priority={step.id === 1}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 z-30 h-12 w-12 -translate-y-1/2 rounded-full opacity-70 hover:opacity-100"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous slide</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 z-30 h-12 w-12 -translate-y-1/2 rounded-full opacity-70 hover:opacity-100"
            onClick={scrollNext}
            disabled={!canScrollNext}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next slide</span>
          </Button>
        </div>

        <DialogFooter className="p-4 md:p-6">
          <Button type="button" onClick={() => setOpen(false)}>
            I understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
