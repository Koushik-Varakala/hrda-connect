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
    districts: string[];
    capital: string;
    heroDescription: string;
    aboutUsDescription: string;
    registrationTagline: string;
    phone: string;
    email: string;
    whatsappOnly: boolean;
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
    domain: 'hrda-india.org',
    districts: [
        "Adilabad", "Bhadradri Kothagudem", "Hanumakonda", "Hyderabad", "Jagtial",
        "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy",
        "Karimnagar", "Khammam", "Kumuram Bheem Asifabad", "Mahabubabad",
        "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu",
        "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad",
        "Peddapalli", "Rajanna Sircilla", "Ranga Reddy", "Sangareddy",
        "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"
    ],
    capital: 'Hyderabad',
    heroDescription: 'HRDA works tirelessly with governments and regulators to improve medical education, strengthen primary healthcare, and protect the interests of doctors across Telangana.',
    aboutUsDescription: 'The Healthcare Reforms Doctors Association (HRDA) was established with a singular vision: to create a transparent, efficient, and equitable healthcare system in Telangana.',
    registrationTagline: 'Join the strongest voice for doctors in Telangana. Your support strengthens our cause.',
    phone: '+91 98490 00000',
    email: 'hrda4people@gmail.com',
    whatsappOnly: false,
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
    domain: 'ap.hrda-india.org',
    districts: [
        "Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna",
        "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam",
        "Vizianagaram", "West Godavari", "YSR Kadapa",
        "Alluri Sitharama Raju", "Anakapalli", "Annamayya", "Bapatla",
        "Eluru", "Kakinada", "Konaseema", "Nandyal", "NTR", "Palnadu",
        "Parvathipuram Manyam", "Tirupati"
    ],
    capital: 'Amaravati',
    heroDescription: 'HRDA works tirelessly with governments and regulators to improve medical education, strengthen primary healthcare, and protect the interests of doctors across Andhra Pradesh.',
    aboutUsDescription: 'The Healthcare Reforms Doctors Association (HRDA) was established with a singular vision: to create a transparent, efficient, and equitable healthcare system in Andhra Pradesh.',
    registrationTagline: 'Join the strongest voice for doctors in Andhra Pradesh. Your support strengthens our cause.',
    phone: '+91 77992 88889',
    email: 'hrdareforms@gmail.com',
    whatsappOnly: true,
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
