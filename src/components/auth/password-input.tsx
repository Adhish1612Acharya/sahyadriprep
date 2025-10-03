"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PasswordInputProps = React.ComponentProps<typeof Input> & {
  label?: string;
  inputId?: string;
};

export function PasswordInput({
  label,
  inputId,
  ...props
}: PasswordInputProps) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        // Using native label to keep dependencies minimal
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      ) : null}
      <div className="flex items-center gap-2">
        <Input
          id={inputId}
          type={show ? "text" : "password"}
          autoComplete={show ? "off" : "current-password"}
          {...props}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          aria-label="Toggle password visibility"
        >
          {show ? "Hide" : "Show"}
        </Button>
      </div>
    </div>
  );
}
