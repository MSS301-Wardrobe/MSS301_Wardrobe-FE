import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "sonner";
import { QueryProvider } from "./providers/QueryProvider";
import { AuthProvider } from "./providers/AuthProvider";

export default function App() {
  return (
    <QueryProvider>
      <RouterProvider
        router={router}
        future={{ v7_startTransition: true }}
      />
      <Toaster position="top-right" richColors />
    </QueryProvider>
  );
}
