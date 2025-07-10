"use client";
import React from "react";

interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

const Alert = ({ alert }: { alert: AlertState }) =>
  alert.open ? (
    <div
      className={`alert ${
        alert.severity === "success" ? "alert-success" : "alert-error"
      } fixed top-4 right-4 z-50 max-w-md transition-opacity duration-300`}
    >
      <span>{alert.message}</span>
    </div>
  ) : null;

export default Alert;