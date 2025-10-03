"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type CardItemProps = {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
  onRemove?: () => void
  removeLabel?: string
}

export function CardItem({
  title,
  description,
  children,
  footer,
  className,
  onRemove,
  removeLabel = "Remove",
}: CardItemProps) {
  return (
    <Card className={cn("bg-card text-card-foreground border-border", className)}>
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg">{title}</CardTitle>
          {onRemove ? (
            <Button variant="ghost" size="sm" onClick={onRemove} aria-label={removeLabel}>
              {removeLabel}
            </Button>
          ) : null}
        </div>
        {description ? <CardDescription className="text-muted-foreground">{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
      {footer ? <CardFooter className="border-t border-border">{footer}</CardFooter> : null}
    </Card>
  )
}
