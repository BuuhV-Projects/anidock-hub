import React from "react";
import {
    AnimeDetails,
    Auth,
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
    Player,
    PremiumFeatures,
    ResetPassword,
    UpdatePassword,
    useAuth,
    VerifyOtp
} from "@anidock/app-core";
import { ProtectedRoute } from "@anidock/shared-ui";
import { Route, Routes } from "react-router-dom";

const RouterAppCore = () => {
    const { user, loading } = useAuth();

    return (
        <Routes>
            <Route path="/" element={<Browse />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/anime" element={<AnimeDetails />} />
            <Route path="/player" element={<Player />} />
            <Route path="/history" element={<History />} />
            <Route path="/drivers/import" element={<ImportDriver />} />
            <Route path="/drivers/create" element={
                <ProtectedRoute user={user} loading={loading}>
                    <CreateDriver />
                </ProtectedRoute>
            } />
            <Route path="/drivers/:driverId/edit" element={
                <ProtectedRoute user={user} loading={loading}>
                    <EditDriver />
                </ProtectedRoute>
            } />
            <Route path="/drivers" element={
                <ProtectedRoute user={user} loading={loading}>
                    <MyDrivers />
                </ProtectedRoute>
            } />
            <Route path="/drivers/:driverId/index-manual" element={
                <ProtectedRoute user={user} loading={loading}>
                    <IndexManual />
                </ProtectedRoute>
            } />
            <Route path="/drivers/:driverId/edit-anime" element={
                <ProtectedRoute user={user} loading={loading}>
                    <EditIndexedAnime />
                </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
                <ProtectedRoute user={user} loading={loading}>
                    <Dashboard />
                </ProtectedRoute>
            } />
            <Route path="/premium" element={<PremiumFeatures />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};


export default RouterAppCore;