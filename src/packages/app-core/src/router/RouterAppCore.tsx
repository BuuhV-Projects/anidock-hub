import React from "react";
import { Route, Routes } from "react-router-dom";
import AddAnime from "../pages/AddAnime";
import AnimeDetails from "../pages/AnimeDetails";
import Backup from "../pages/Backup";
import Browse from "../pages/Browse";
import CreateDriver from "../pages/CreateDriver";
import Dashboard from "../pages/Dashboard";
import EditDriver from "../pages/EditDriver";
import EditIndexedAnime from "../pages/EditIndexedAnime";
import History from "../pages/History";
import ImportDriver from "../pages/ImportDriver";
import IndexManual from "../pages/IndexManual";
import MyDrivers from "../pages/MyDrivers";
import NotFound from "../pages/NotFound";
import Player from "../pages/Player";
import Settings from "../pages/Settings";

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
            <Route path="/drivers/:driverId/add-anime" element={<AddAnime />} />
            <Route path="/drivers/add-anime" element={<AddAnime />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/backup" element={<Backup />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default RouterAppCore;