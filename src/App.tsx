import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import FillPage from "./pages/FillPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary/90 backdrop-blur-sm text-primary-foreground text-center py-2 px-4 text-sm">
            Preview of the project for <a href="https://onemillionlines.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-foreground/80">onemillionlines.com</a>
          </div>
        <div className="mt-10">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/edit/:templateId" element={<Editor />} />
          <Route path="/fill/:shareId" element={<FillPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
