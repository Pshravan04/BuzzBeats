"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

const desktop = "(min-width: 768px)"

function Credenza({ children, ...props }: React.ComponentPropsWithoutRef<typeof Dialog>) {
  const isDesktop = useMediaQuery(desktop)
  const Credenza = isDesktop ? Dialog : Drawer
  return <Credenza {...props}>{children}</Credenza>
}

function CredenzaTrigger({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof DialogTrigger>) {
  const isDesktop = useMediaQuery(desktop)
  const CredenzaTrigger = isDesktop ? DialogTrigger : DrawerTrigger
  return <CredenzaTrigger className={className} {...props}>{children}</CredenzaTrigger>
}

function CredenzaClose({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof DialogClose>) {
  const isDesktop = useMediaQuery(desktop)
  const CredenzaClose = isDesktop ? DialogClose : DrawerClose
  return <CredenzaClose className={className} {...props}>{children}</CredenzaClose>
}

function CredenzaContent({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof DialogContent>) {
  const isDesktop = useMediaQuery(desktop)
  const CredenzaContent = isDesktop ? DialogContent : DrawerContent
  return <CredenzaContent className={className} {...props}>{children}</CredenzaContent>
}

function CredenzaDescription({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof DialogDescription>) {
  const isDesktop = useMediaQuery(desktop)
  const CredenzaDescription = isDesktop ? DialogDescription : DrawerDescription
  return <CredenzaDescription className={className} {...props}>{children}</CredenzaDescription>
}

function CredenzaHeader({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof DialogHeader>) {
  const isDesktop = useMediaQuery(desktop)
  const CredenzaHeader = isDesktop ? DialogHeader : DrawerHeader
  return <CredenzaHeader className={className} {...props}>{children}</CredenzaHeader>
}

function CredenzaTitle({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof DialogTitle>) {
  const isDesktop = useMediaQuery(desktop)
  const CredenzaTitle = isDesktop ? DialogTitle : DrawerTitle
  return <CredenzaTitle className={className} {...props}>{children}</CredenzaTitle>
}

function CredenzaBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 md:px-0", className)} {...props}>{children}</div>
}

function CredenzaFooter({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof DialogFooter>) {
  const isDesktop = useMediaQuery(desktop)
  const CredenzaFooter = isDesktop ? DialogFooter : DrawerFooter
  return <CredenzaFooter className={className} {...props}>{children}</CredenzaFooter>
}

export {
  Credenza,
  CredenzaTrigger,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
  CredenzaFooter,
}
