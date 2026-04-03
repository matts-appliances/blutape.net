export const MACHINE_CONDITIONS = {
  new: "NEW",
  used: "USED",
  scratch_and_dent: "Scratch and Dent",
};

export const VENDORS = {
  pasadena: "Pasadena (Miguel)",
  baton_rouge: "Baton Rouge",
  college_station: "College Station",
  alexandria: "Alexandria",
  stines: "Stines",
  scrappers: "Scrappers",
  viking: "Viking",
  unknown: "Unknown",
};

export const STATUS = {
  in_progress: "Active",
  completed: "Completed",
  trashed: "Trashed",
  archived: "Archived",
};

export const TYPES = {
  fridge: "Fridge",
  washer: "Washer",
  dryer: "Dryer",
  range: "Range",
  microwave: "Microwave",
  water_heater: "Water Heater",
  stackable: "Stackable",
  dishwasher: "Dishwasher",
};

export const ROLES = {
  admin: "Admin",
  cleaner: "Cleaner",
  delivery: "Delivery",
  sales: "Sales",
  technician: "Technician",
};

export const APPLIANCE_CATEGORIES = {
  refrigerator: "Refrigerator",
  freezer: "Freezer",
  washer: "Washer",
  dryer: "Dryer",
  range: "Range",
  oven: "Oven",
  microwave: "Microwave",
  water_heater: "Water Heater",
  laundry_tower: "Laundry Tower",
  dishwasher: "Dishwasher",
};

const FF = {
  refrigerator: {
    top_and_bottom: "Top & Bottom",
    side_by_side: "Side by Side",
    french_door: "French Door",
    bottom_top: "Bottom Mount",
  },
  freezer: {
    upright: "Upright",
    chest: "Chest",
  },
  washer: {
    top_load: "Top Load",
    front_load: "Front Load",
    all_in_one: "All in One",
  },
  dryer: {
    top_load_gas: "Top Load Gas",
    front_load_gas: "Front Load Gas",
    top_load_electric: "Top Load Electric",
    front_load_electric: "Front Load Electric",
    all_in_one: "All in One",
  },
  range: {
    gas: "Gas",
    coil: "Coil",
    glass_top: "Glass Top",
  },
  oven: {
    gas: "Gas",
    coil: "Coil",
    glass_top: "Glass Top",
  },
  microwave: {
    countertop: "Countertop",
    over_the_range: "Over the Range",
    built_in: "Built-In",
  },
  water_heater: {
    gas: "Gas",
    electric: "Electric",
  },
  laundry_tower: {
    gas: "Gas",
    electric: "Electric",
  },
  dishwasher: {
    x_18: "18 inch",
    x_24: "24 inch",
  },
};

export const FORM_FACTOR = (appliance_category) => {
  return FF[appliance_category] ?? {};
};

export const COLORS = {
  black: "Black",
  black_stainless: "Black Stainless",
  blue: "Blue",
  bronze: "Bronze",
  brown: "Brown",
  champagne: "Champagne",
  cream: "Cream",
  gold: "Gold",
  green: "Green",
  grey: "Grey",
  orange: "Orange",
  other: "Other",
  panel_ready: "Panel Ready",
  purple: "Purple",
  red: "Red",
  silver: "Silver",
  stainless: "Stainless",
  teal: "Teal",
  white: "White",
  white_stainless: "White Stainless",
  wood: "Wood",
  yellow: "Yellow",
};
