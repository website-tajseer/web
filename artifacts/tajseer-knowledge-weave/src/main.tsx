import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";

import { ErrorBoundary } from "@/components/error-boundary";

import "./index.css";

const Gate1Environment = lazy(() => import("./gate1/Gate1Environment"));
const Gate1Architecture = lazy(() => import("./gate1architecture/Gate1Architecture"));
const Gate2A = lazy(() => import("./gate2a/Gate2A"));
const HomePrototype = lazy(() => import("./homeprototype/HomePrototype"));
const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
const isGate1Environment = normalizedPath.endsWith("/gate-1-environment");
const isGate1Architecture = normalizedPath.endsWith("/gate-1-tajseer-architecture");
const isHomePrototype = normalizedPath.endsWith("/homepage-prototype");

createRoot(document.getElementById("root")!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    {isHomePrototype ? (
      <Suspense fallback={null}>
        <HomePrototype />
      </Suspense>
    ) : isGate1Architecture ? (
      <Suspense fallback={null}>
        <Gate1Architecture />
      </Suspense>
    ) : isGate1Environment ? (
      <Suspense fallback={null}>
        <Gate1Environment />
      </Suspense>
    ) : (
      <Suspense fallback={null}>
        <Gate2A />
      </Suspense>
    )}
  </ErrorBoundary>,
);
