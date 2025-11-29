import React from "react";
import {
    AnimeDetails,
    Backup,
    Browse,
    CreateDriver,
    Dashboard,
    EditDriver,
    EditIndexedAnime,
    History,
    ImportDriver,
    IndexManual,
    MyDrivers,
    NotFound,
    Player
} from "@anidock/app-core";
import Settings from "../pages/Settings";
import { Route, Routes } from "react-router-dom";

const RouterAppCore = () => {
    return (
        <Routes>
            <Route path="/" element={<Browse />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/anime" element={<AnimeDetails />} />
            <Route path="/player" element={<Player />} />
            <Route path="/history" element={<History />} />
            <Route path="/drivers/import" element={<ImportDriver />} />
            <Route path="/drivers/create" element={<CreateDriver />} />
            <Route path="/drivers/:driverId/edit" element={<EditDriver />} />
            <Route path="/drivers" element={<MyDrivers />} />
            <Route path="/drivers/:driverId/index-manual" element={<IndexManual />} />
            <Route path="/drivers/:driverId/edit-anime" element={<EditIndexedAnime />} />
            <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/backup" element={<Backup />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RouterAppCore;