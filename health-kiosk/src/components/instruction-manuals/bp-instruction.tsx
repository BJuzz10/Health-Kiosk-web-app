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
    image: "/instructions/bp/1.png",
  },
  {
    id: 2,
    image: "/instructions/bp/2.png",
  },
  {
    id: 3,
    image: "/instructions/bp/3.png",
  },
  {
    id: 4,
    image: "/instructions/bp/4.png",
  },
  {
    id: 5,
    image: "/instructions/bp/5.png",
  },
  {
    id: 6,
    image: "/instructions/bp/6.png",
  },
  {
    id: 7,
    image: "/instructions/bp/7.png",
  },
  {
    id: 8,
    image: "/instructions/bp/8.png",
  },
  {
    id: 9,
    image: "/instructions/bp/9.png",
  },
  {
    id: 10,
    image: "/instructions/bp/10.png",
  },
  {
    id: 11,
    image: "/instructions/bp/11.png",
  },
]

export default function BPInstructionManual() {
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
        <Button variant="outline">BP Instructions</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] xl:max-w-[900px] p-0 md:p-6">
        <DialogHeader>
          <DialogTitle>Blood Pressure - Omron Connect</DialogTitle>
          <DialogDescription>
            Follow these instructions to properly use your Omron Connect device for blood pressure monitoring.
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
