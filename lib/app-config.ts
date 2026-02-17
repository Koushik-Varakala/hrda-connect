/**
 * Multi-Region Configuration
 * 
 * Provides region-specific constants for Telangana (TG) and Andhra Pradesh (AP)
 * based on the REGION environment variable.
 * 
 * Usage:
 *   import { appConfig } from '@/lib/app-config';
 *   console.log(appConfig.stateName); // "Telangana" or "Andhra Pradesh"
 */

export type Region = 'TG' | 'AP';

export interface RegionConfig {
    region: Region;
    stateName: string;
    stateNameFull: string;
    medicalCouncil: string;
    medicalCouncilShort: string;
    medicalCouncilId: string;
    organizationName: string;
    welcomeMessage: string;
    domain: string;
}

const TG_CONFIG: RegionConfig = {
    region: 'TG',
    stateName: 'Telangana',
    stateNameFull: 'Telangana',
    medicalCouncil: 'Telangana State Medical Council',
    medicalCouncilShort: 'TGMC',
    medicalCouncilId: 'TGMC ID',
    organizationName: 'Healthcare Reforms Doctors Association - Telangana',
    welcomeMessage: 'Welcome to HRDA Telangana',
    domain: 'hrda-india.org'
};

const AP_CONFIG: RegionConfig = {
    region: 'AP',
    stateName: 'Andhra Pradesh',
    stateNameFull: 'Andhra Pradesh',
    medicalCouncil: 'Andhra Pradesh Medical Council',
    medicalCouncilShort: 'APMC',
    medicalCouncilId: 'APMC ID',
    organizationName: 'Healthcare Reforms Doctors Association - Andhra Pradesh',
    welcomeMessage: 'Welcome to HRDA Andhra Pradesh',
    domain: 'ap.hrda-india.org'
};

/**
 * Get configuration based on NEXT_PUBLIC_REGION environment variable
 * Defaults to TG if not set (backward compatibility)
 * Using NEXT_PUBLIC_REGION to ensure it's available on both server and client
 */
function getConfig(): RegionConfig {
    const region = (process.env.NEXT_PUBLIC_REGION || 'TG').toUpperCase() as Region;

    switch (region) {
        case 'AP':
            return AP_CONFIG;
        case 'TG':
        default:
            return TG_CONFIG;
    }
}

/**
 * Current application configuration
 * Use this throughout the app for region-specific values
 */
export const appConfig = getConfig();

/**
 * Helper to check if current region is TG
 */
export const isTelangana = () => appConfig.region === 'TG';

/**
 * Helper to check if current region is AP
 */
export const isAndhraPradesh = () => appConfig.region === 'AP';
