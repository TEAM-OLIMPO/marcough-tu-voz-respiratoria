import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Perfiles from "./pages/Perfiles";
import Sintomas from "./pages/Sintomas";
import Grabacion from "./pages/Grabacion";
import Resultado from "./pages/Resultado";
import Historial from "./pages/Historial";
import ComoFunciona from "./pages/ComoFunciona";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/perfiles" element={<Perfiles />} />
          <Route path="/sintomas" element={<Sintomas />} />
          <Route path="/grabacion" element={<Grabacion />} />
          <Route path="/resultado" element={<Resultado />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/como-funciona" element={<ComoFunciona />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
