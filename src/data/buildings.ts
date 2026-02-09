import { Building, Unit } from "@/types/rent";

export const buildings: Building[] = [
  { id: "plot-125", name: "Plot 125", location: "Al Ain" },
  { id: "plot-127", name: "Plot 127", location: "Al Ain" },
  { id: "plot-164", name: "Plot 164", location: "Al Ain" },
  { id: "plot-211", name: "Plot 211", location: "Al Ain" },
  { id: "plot-14", name: "Plot 14", location: "Al Ain" },
];

export const units: Unit[] = [
  // Plot 125
  { id: "p125-f009", buildingId: "plot-125", unitNumber: "Flat 009", type: "1 BR", annualRent: 25000 },
  { id: "p125-f010", buildingId: "plot-125", unitNumber: "Flat 010", type: "1 BR", annualRent: 27000 },
  { id: "p125-f018", buildingId: "plot-125", unitNumber: "Flat 018", type: "1 BR", area: 54.87, annualRent: 25000 },

  // Plot 127
  { id: "p127-o001", buildingId: "plot-127", unitNumber: "Office 1", type: "Office", annualRent: 30000 },
  { id: "p127-f008", buildingId: "plot-127", unitNumber: "Flat 008", type: "1 BR", annualRent: 27000 },
  { id: "p127-f018", buildingId: "plot-127", unitNumber: "Flat 018", type: "1 BR", area: 54.87, annualRent: 25000 },

  // Plot 164 - Offices
  { id: "p164-m101", buildingId: "plot-164", unitNumber: "M101", type: "Office", area: 69, annualRent: 47250 },
  { id: "p164-m102", buildingId: "plot-164", unitNumber: "M102", type: "Office", area: 84, annualRent: 51250 },
  { id: "p164-m103", buildingId: "plot-164", unitNumber: "M103", type: "Office", area: 64, annualRent: 43000 },
  { id: "p164-m104", buildingId: "plot-164", unitNumber: "M104", type: "Office", area: 45, annualRent: 32000 },
  { id: "p164-m105", buildingId: "plot-164", unitNumber: "M105", type: "Office", area: 45, annualRent: 75000 },
  { id: "p164-m106", buildingId: "plot-164", unitNumber: "M106", type: "Office", area: 64, annualRent: 75000 },
  { id: "p164-m107", buildingId: "plot-164", unitNumber: "M107", type: "Office", area: 84, annualRent: 50584 },
  { id: "p164-m108", buildingId: "plot-164", unitNumber: "M108", type: "Office", area: 69, annualRent: 44100 },
  { id: "p164-m201-m202", buildingId: "plot-164", unitNumber: "M201 & M202", type: "Office", area: 153, annualRent: 55000 },
  { id: "p164-m203", buildingId: "plot-164", unitNumber: "M203", type: "Office", area: 84, annualRent: 48000 },
  { id: "p164-m204", buildingId: "plot-164", unitNumber: "M204", type: "Office", area: 69, annualRent: 40000 },
  { id: "p164-m205-m206", buildingId: "plot-164", unitNumber: "M205 & M206", type: "Office", area: 153, annualRent: 86000 },
  { id: "p164-m207", buildingId: "plot-164", unitNumber: "M207", type: "Office", area: 84, annualRent: 48300 },
  { id: "p164-m208", buildingId: "plot-164", unitNumber: "M208", type: "Office", area: 69, annualRent: 14000 },

  // Plot 164 - Residential
  { id: "p164-t301", buildingId: "plot-164", unitNumber: "T301", type: "1 BR", area: 82, annualRent: 32550 },
  { id: "p164-t302", buildingId: "plot-164", unitNumber: "T302", type: "2 BR", area: 121, annualRent: 43100 },
  { id: "p164-t303", buildingId: "plot-164", unitNumber: "T303", type: "2 BR", area: 121, annualRent: 43100 },
  { id: "p164-t304", buildingId: "plot-164", unitNumber: "T304", type: "1 BR", area: 82, annualRent: 32550 },
  { id: "p164-t305", buildingId: "plot-164", unitNumber: "T305", type: "1 BR", area: 82, annualRent: 32550 },
  { id: "p164-t306", buildingId: "plot-164", unitNumber: "T306", type: "2 BR", area: 121, annualRent: 42000 },
  { id: "p164-t307", buildingId: "plot-164", unitNumber: "T307", type: "2 BR", area: 121, annualRent: 42000 },
  { id: "p164-t308", buildingId: "plot-164", unitNumber: "T308", type: "1 BR", area: 82, annualRent: 17350 },
  { id: "p164-t401", buildingId: "plot-164", unitNumber: "T401", type: "1 BR", area: 82, annualRent: 39087 },
  { id: "p164-t402", buildingId: "plot-164", unitNumber: "T402", type: "2 BR", area: 121, annualRent: 42000 },
  { id: "p164-t403", buildingId: "plot-164", unitNumber: "T403", type: "2 BR", area: 121, annualRent: 40000 },
  { id: "p164-t404", buildingId: "plot-164", unitNumber: "T404", type: "1 BR", area: 82, annualRent: 31000 },
  { id: "p164-t405", buildingId: "plot-164", unitNumber: "T405", type: "1 BR", area: 82, annualRent: 34000 },
  { id: "p164-t406", buildingId: "plot-164", unitNumber: "T406", type: "2 BR", area: 121, annualRent: 40000 },
  { id: "p164-t407", buildingId: "plot-164", unitNumber: "T407", type: "2 BR", area: 121, annualRent: 43100 },
  { id: "p164-t408", buildingId: "plot-164", unitNumber: "T408", type: "1 BR", area: 82, annualRent: 32550 },

  // Plot 164 - Showrooms
  { id: "p164-front-showroom", buildingId: "plot-164", unitNumber: "Front Showroom", type: "Showroom", area: 765.34, annualRent: 525000 },
  { id: "p164-back-showroom-1", buildingId: "plot-164", unitNumber: "Back Showroom No-1", type: "Showroom", area: 313, annualRent: 180000 },
  { id: "p164-back-showroom-2", buildingId: "plot-164", unitNumber: "Back Showroom No-2", type: "Showroom", area: 109.44, annualRent: 178500 },

  // Plot 211 - Offices
  { id: "p211-m101-104", buildingId: "plot-211", unitNumber: "M-101, 102, 103 & 104", type: "Office", area: 267.92, annualRent: 175000 },
  { id: "p211-m201", buildingId: "plot-211", unitNumber: "M-201", type: "Office", area: 65.77, annualRent: 35000 },
  { id: "p211-m202", buildingId: "plot-211", unitNumber: "M-202", type: "Office", area: 65.77, annualRent: 38750 },
  { id: "p211-m203", buildingId: "plot-211", unitNumber: "M-203", type: "Office", area: 68.19, annualRent: 38000 },
  { id: "p211-m204", buildingId: "plot-211", unitNumber: "M-204", type: "Office", area: 68.19, annualRent: 36750 },

  // Plot 211 - Residential
  { id: "p211-t101", buildingId: "plot-211", unitNumber: "T-101", type: "3 BR", area: 185, annualRent: 55000 },
  { id: "p211-t102", buildingId: "plot-211", unitNumber: "T-102", type: "3 BR", area: 185, annualRent: 54600 },
  { id: "p211-t201", buildingId: "plot-211", unitNumber: "T-201", type: "3 BR", area: 185, annualRent: 65000 },
  { id: "p211-t202", buildingId: "plot-211", unitNumber: "T-202", type: "3 BR", area: 185, annualRent: 55000 },

  // Plot 211 - Showroom
  { id: "p211-basement-showroom", buildingId: "plot-211", unitNumber: "Basement & Showroom", type: "Showroom", area: 495.5, annualRent: 460000 },

  // Plot 14 - Villas
  { id: "p14-villa-1", buildingId: "plot-14", unitNumber: "Villa 1", type: "Villa", annualRent: 24000 },
  { id: "p14-villa-2", buildingId: "plot-14", unitNumber: "Villa 2", type: "Villa", annualRent: 36750 },
  { id: "p14-villa-3", buildingId: "plot-14", unitNumber: "Villa 3", type: "Villa", annualRent: 36750 },
  { id: "p14-villa-4", buildingId: "plot-14", unitNumber: "Villa 4", type: "Villa", annualRent: 50000 },
];

export function isCommercialUnit(type: string): boolean {
  return ["Office", "Showroom"].includes(type);
}

export function getUnitsByBuilding(buildingId: string): Unit[] {
  return units.filter((u) => u.buildingId === buildingId);
}

export function getBuildingById(id: string): Building | undefined {
  return buildings.find((b) => b.id === id);
}

export function getUnitById(id: string): Unit | undefined {
  return units.find((u) => u.id === id);
}
