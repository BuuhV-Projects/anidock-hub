import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import LGPD from "./pages/LGPD";
import Copyright from "./pages/Copyright";
import { NotFound } from "@anidock/app-core";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/termos" element={<TermsOfService />} />
      <Route path="/privacidade" element={<PrivacyPolicy />} />
      <Route path="/lgpd" element={<LGPD />} />
      <Route path="/direitos-autorais" element={<Copyright />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;

