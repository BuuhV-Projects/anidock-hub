import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Library from "../pages/Library";

const RouterAppCore = () => {
  return (
    <Routes>
      <Route path="/" element={<Library />} />
      <Route path="/library" element={<Library />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default RouterAppCore;
