import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface City {
    country: string;
    name: string;
}
export interface Preferences {
    city: string;
    unit: string;
}
export interface backendInterface {
    getCities(): Promise<Array<City>>;
    getPreferences(sessionKey: string): Promise<Preferences | null>;
    savePreferences(sessionKey: string, preferences: Preferences): Promise<void>;
}
