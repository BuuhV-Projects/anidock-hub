import { useContext } from "react";
import { PlataformContext } from "./plataform-context";

export const usePlataform = () => {
    const context = useContext(PlataformContext);
    if (context === undefined) {
        throw new Error('usePlataform must be used within a PlataformProvider');
    }
    return context;
}