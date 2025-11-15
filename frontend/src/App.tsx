import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { routes } from "./routes";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingFallback() {
  return (
    <div className="container py-8">
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {routes.map((route) => {
            if (route.protected) {
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <ProtectedRoute requiredRole={route.requiredRole}>
                      {route.element}
                    </ProtectedRoute>
                  }
                />
              );
            }
            return <Route key={route.path} path={route.path} element={route.element} />;
          })}
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;

