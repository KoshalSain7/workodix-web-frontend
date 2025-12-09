"use client";

import { X } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";
import React, { createContext, useContext } from "react";

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ 
  asChild, 
  children, 
  onClick 
}: { 
  asChild?: boolean; 
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const context = useContext(DialogContext);
  
  const handleClick = (e: any) => {
    if (context) {
      context.onOpenChange(true);
    }
    if (onClick) {
      onClick();
    }
    if (children && React.isValidElement(children)) {
      const childProps = children.props as any;
      if (childProps.onClick) {
        childProps.onClick(e);
      }
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { 
      onClick: handleClick
    } as any);
  }
  return <div onClick={handleClick} className="cursor-pointer">{children}</div>;
}

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const context = useContext(DialogContext);
  
  if (!context || !context.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 animate-fade-in"
        onClick={() => context.onOpenChange(false)}
      />
      
      {/* Dialog Content */}
      <div className={cn("relative z-50 w-full max-w-md mx-4", className)}>
        <Card className="max-h-[90vh] overflow-y-auto animate-scale-in">
          <CardContent className="pt-6">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
      <CardTitle>{children}</CardTitle>
    </CardHeader>
  );
}

