"use client"

import { MountainSnowIcon } from "lucide-react"

import { useWorkshop } from "@/lib/workshop/store"

/** Shop name and logo from General settings, falling back to the product mark. */
export function AppBarBrand() {
  const { general } = useWorkshop()

  return (
    <>
      <span className="flex size-7 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground">
        {general.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={general.logo} alt="" className="size-7 object-contain" />
        ) : (
          <MountainSnowIcon className="size-4" />
        )}
      </span>
      <span className="text-[15px] font-semibold tracking-[-0.01em]">
        {general.name || "Workshop Admin"}
      </span>
    </>
  )
}
