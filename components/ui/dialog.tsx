"use client";

import { X } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, title, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 animate-fade-in"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog Content */}
      <Card className="relative z-50 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
        {title && (
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>{title}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
        )}
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

