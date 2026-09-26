// ============================================================================
// PROXY DATA SOURCES
// ============================================================================
// There is no live "local market demand" API for rural India.
// We use proxy-data modeling instead:
//
//   Local Demand Estimate = Local Population (Census)
//                          × Per-Capita Consumption Rate (NSSO data)
//
//   Supply-Demand Gap = Local Demand Estimate − Existing Local Supply
//
// This gives an honest, defensible feasibility number without needing
// an API that doesn't exist.
//
// Source: Census of India 2011 (latest complete), NSSO 78th Round,
//         Livestock Census 2019, Udyam Registration Dashboard
// ============================================================================

import type { BusinessCategory } from "../types"

/** Per-capita annual consumption rates by category (NSSO-derived estimates) */
export const PER_CAPITA_CONSUMPTION: Record<
  BusinessCategory,
  { annualPerCapitaINR: number; unit: string; source: string }
> = {
  dairy: {
    annualPerCapitaINR: 3200,
    unit: "litres milk equivalent",
    source: "NSSO 78th Round, NSS Schedule 2.12",
  },
  retail: {
    annualPerCapitaINR: 18000,
    unit: "general merchandise",
    source: "NSSO 78th Round, Consumer Expenditure",
  },
  tailoring: {
    annualPerCapitaINR: 2400,
    unit: "garments/year",
    source: "NSSO 68th Round, Employment-Unemployment",
  },
  "agri-processing": {
    annualPerCapitaINR: 5600,
    unit: "processed food items",
    source: "NSSO 78th Round, Food Consumption",
  },
  "small-manufacturing": {
    annualPerCapitaINR: 8000,
    unit: "manufactured goods",
    source: "NSSO 78th Round, Consumer Expenditure",
  },
  services: {
    annualPerCapitaINR: 4200,
    unit: "service transactions",
    source: "NSSO 78th Round, Miscellaneous Services",
  },
  trading: {
    annualPerCapitaINR: 12000,
    unit: "traded goods",
    source: "NSSO 78th Round, Consumer Expenditure",
  },
  other: {
    annualPerCapitaINR: 6000,
    unit: "general",
    source: "NSSO 78th Round, Consumer Expenditure",
  },
}

/** Estimated population density per block (rural India average) */
export const POPULATION_ESTIMATES: Record<
  string,
  {
    avgBlockPopulation: number
    avgVillagePopulation: number
    urbanizationRate: number
    source: string
  }
> = {
  // State-level estimates (based on Census 2011, projected to 2024)
  UP: {
    avgBlockPopulation: 180000,
    avgVillagePopulation: 2500,
    urbanizationRate: 0.22,
    source: "Census 2011, District Census Handbook UP",
  },
  Bihar: {
    avgBlockPopulation: 150000,
    avgVillagePopulation: 2200,
    urbanizationRate: 0.11,
    source: "Census 2011, District Census Handbook Bihar",
  },
  MP: {
    avgBlockPopulation: 160000,
    avgVillagePopulation: 2000,
    urbanizationRate: 0.28,
    source: "Census 2011, District Census Handbook MP",
  },
  Maharashtra: {
    avgBlockPopulation: 140000,
    avgVillagePopulation: 1800,
    urbanizationRate: 0.45,
    source: "Census 2011, District Census Handbook Maharashtra",
  },
  Rajasthan: {
    avgBlockPopulation: 170000,
    avgVillagePopulation: 2100,
    urbanizationRate: 0.25,
    source: "Census 2011, District Census Handbook Rajasthan",
  },
  WestBengal: {
    avgBlockPopulation: 190000,
    avgVillagePopulation: 2800,
    urbanizationRate: 0.32,
    source: "Census 2011, District Census Handbook West Bengal",
  },
  TamilNadu: {
    avgBlockPopulation: 130000,
    avgVillagePopulation: 1600,
    urbanizationRate: 0.48,
    source: "Census 2011, District Census Handbook Tamil Nadu",
  },
  Karnataka: {
    avgBlockPopulation: 145000,
    avgVillagePopulation: 1900,
    urbanizationRate: 0.39,
    source: "Census 2011, District Census Handbook Karnataka",
  },
  Gujarat: {
    avgBlockPopulation: 155000,
    avgVillagePopulation: 2000,
    urbanizationRate: 0.43,
    source: "Census 2011, District Census Handbook Gujarat",
  },
  Odisha: {
    avgBlockPopulation: 135000,
    avgVillagePopulation: 1700,
    urbanizationRate: 0.17,
    source: "Census 2011, District Census Handbook Odisha",
  },
  DEFAULT: {
    avgBlockPopulation: 155000,
    avgVillagePopulation: 2100,
    urbanizationRate: 0.30,
    source: "Census 2011 (national average estimate)",
  },
}

/** Estimated competitor density per block by category */
export const COMPETITOR_DENSITY: Record<
  BusinessCategory,
  {
    avgPerBlock: number
    classification: "low" | "moderate" | "high"
    source: string
  }
> = {
  dairy: {
    avgPerBlock: 12,
    classification: "moderate",
    source: "Livestock Census 2019, Udyam registrations",
  },
  retail: {
    avgPerBlock: 45,
    classification: "high",
    source: "Udyam Assist Platform, MSME data",
  },
  tailoring: {
    avgPerBlock: 20,
    classification: "moderate",
    source: "Udyam registrations, NSSO employment data",
  },
  "agri-processing": {
    avgPerBlock: 8,
    classification: "low",
    source: "Udyam registrations, MoFPI data",
  },
  "small-manufacturing": {
    avgPerBlock: 15,
    classification: "moderate",
    source: "Udyam registrations, District Industries Centre data",
  },
  services: {
    avgPerBlock: 30,
    classification: "moderate",
    source: "Udyam registrations, NSSO employment data",
  },
  trading: {
    avgPerBlock: 55,
    classification: "high",
    source: "Udyam registrations, MSME data",
  },
  other: {
    avgPerBlock: 20,
    classification: "moderate",
    source: "Estimated from MSME registration data",
  },
}

/** Single-buyer dependency impact factors */
export const SINGLE_BUYER_IMPACT = {
  profitReductionPercent: 40,
  volatilityMultiplier: 2.5,
  recommendation:
    "Single buyer dependency = ~40% lower realized profit. Consider connecting with the local Mandi board / alternate buyers.",
  recommendationHi:
    "Ek buyer pe depend rehna = ~40% kam profit. Local Mandi board se ya alternate buyers se judne ki koshish karein.",
}

/** Business category display names */
export const CATEGORY_NAMES: Record<BusinessCategory, { en: string; hi: string }> = {
  dairy: { en: "Dairy & Allied", hi: "डेयरी और सहायक व्यवसाय" },
  retail: { en: "Retail Shop", hi: "खुदरा दुकान" },
  tailoring: { en: "Tailoring & Garments", hi: "सिलाई-कपड़ा" },
  "agri-processing": { en: "Agri-Processing", hi: "कृषि प्रसंस्करण" },
  "small-manufacturing": { en: "Small Manufacturing", hi: "लघु उद्योग" },
  services: { en: "Local Services", hi: "स्थानीय सेवाएं" },
  trading: { en: "Trading & Wholesale", hi: "व्यापार" },
  other: { en: "Other", hi: "अन्य" },
}
