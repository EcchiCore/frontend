"use client";
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AlertProps {
  title: string;
  message: string;
  variant: "default" | "destructive";
}

const CustomAlert = ({ title, message, variant }: AlertProps) => (
  <Alert variant={variant}>
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

export default CustomAlert;