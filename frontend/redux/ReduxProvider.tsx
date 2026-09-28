'use client';

import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { AppInitializer } from "@/components/AppInitializer";

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <AppInitializer />
            {children}
        </Provider>
    );
}