// Permivo rules data.
// Every rule links to a source and carries a verification status.
// Only mark a rule "verified" when an official county or city page, or a written
// agency reply, supports it. Third-party guides are leads, not sources.
// Keep real addresses and personal data out of this public repository.
// Last updated: November 2026, after the reply from Mecklenburg County CIRC.

export type ProjectType = "deck" | "addition" | "garage" | "trade";
export type Location = "city" | "outside";
export type Status = "verified" | "partly" | "likely" | "unverified";
export type JurisdictionId = "mecklenburg" | "catawba" | "cabarrus" | "union" | "robeson"; // add an id here when a new place is added

export interface Jurisdiction {
  id: JurisdictionId;
  name: string;
  // "verified" = rules checked against official sources with dates.
  // "directory" = only the office and how to reach it, no verified rules yet.
  coverage: "verified" | "directory";
  officeLabel: string;
  officeUrl: string;
  officePhone?: string;
  officeEmail?: string;
  officeAddress?: string;
  note: string;
  // Facts read from official pages. Each one names its source and the date it was read.
  facts?: { text: string; sourceUrl: string; checkedOn: string }[];
}

export const JURISDICTIONS: Record<JurisdictionId, Jurisdiction> = {
  mecklenburg: {
    id: "mecklenburg",
    name: "Mecklenburg County, NC",
    coverage: "verified",
    officeLabel: "Mecklenburg County Code Enforcement",
    officeUrl: "https://code.mecknc.gov",
    officePhone: "980-314-2633",
    note: "Includes the City of Charlotte lot review for projects inside city limits.",
  },
  catawba: {
    id: "catawba",
    name: "Catawba County, NC",
    coverage: "directory",
    officeLabel: "Catawba County Permit Center",
    officeUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/",
    officePhone: "828-465-8399",
    officeEmail: "permitapps@catawbacountync.gov",
    officeAddress: "25 Government Drive, Newton, NC 28658",
    note: "Cities and towns in the county (Hickory, Conover, Newton and others) have their own planning offices for zoning.",
    facts: [
      { text: "The county says most building projects need zoning approval, and a building permit needs an approved zoning permit or a waiver letter from the zoning department.", sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/", checkedOn: "2026-11-15" },
      { text: "Permit applications and plan review applications are done online through the county's ePermits portal.", sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/plan-review/", checkedOn: "2026-11-15" },
      { text: "Permit Center hours: Monday to Friday 8:00am to 5:00pm; permits are issued 8:00am to 4:00pm. Inspections: 828-465-8399.", sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/", checkedOn: "2026-11-15" },
      { text: "A county info sheet (dated 2014, so may be out of date) says a detached accessory structure needs both a zoning permit and a building permit, and a scaled footprint drawing for zoning.", sourceUrl: "https://www.catawbacountync.gov/site/assets/files/2490/residential-accessory.pdf", checkedOn: "2026-11-15" },
    ],
  },
  cabarrus: {
    id: "cabarrus",
    name: "Cabarrus County, NC",
    coverage: "directory",
    officeLabel: "Cabarrus County Construction Standards",
    officeUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access",
    officePhone: "704-920-2128",
    officeEmail: "construction2222@cabarruscounty.us",
    officeAddress: "65 Church St S, Concord, NC 28025",
    note: "Zoning is a separate county office (704-920-2141) and covers unincorporated Cabarrus County only. Properties inside Concord, Kannapolis and other towns follow the town's own rules.",
    facts: [
      { text: "The county says a zoning permit is needed for additions, accessory structures such as a garage or storage building, and for installing or adding on to a deck or patio.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Planning-and-Development/Zoning/Zoning-Permitting", checkedOn: "2026-11-15" },
      { text: "Permits are tracked in the county's Accela portal. The county's permit form lists decks under both Addition and Accessory Structure permit types.", sourceUrl: "https://www.cabarruscounty.us/files/assets/public/v/1/construction-standards/documents/homeowners-permit-guide.pdf", checkedOn: "2026-11-15" },
      { text: "A lien filing is required for projects of $30,000 or more.", sourceUrl: "https://www.cabarruscounty.us/files/assets/public/v/1/construction-standards/documents/homeowners-permit-guide.pdf", checkedOn: "2026-11-15" },
      { text: "Residential building permits for accessory structures (such as a detached garage) and additions (such as a deck, room or screened porch) are applied for online in Accela.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access", checkedOn: "2026-11-15" },
      { text: "The county's plan review service is described as for all new primary residences and for commercial projects. Whether decks, additions or garages go through it is not stated.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Plan-Review", checkedOn: "2026-11-15" },
      { text: "Plan review files must be PDFs, with building and site reviews submitted separately and different document types not combined in one PDF.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Plan-Review", checkedOn: "2026-11-15" },
      { text: "Development Ordinance (copy dated 2021 amendments, so confirm it is current), Section 6-14: an uncovered, unenclosed deck, terrace or patio may extend into a required setback, but never closer than 5 feet to any property line.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Planning-and-Development/Zoning/Zoning-Permitting", checkedOn: "2026-11-15" },
      { text: "Development Ordinance Section 7-3: an accessory building up to 15 feet tall must meet the house's front and side setbacks, with a rear setback of at least 5 feet. Taller buildings must meet the house's setbacks. Impervious and structural coverage limits also apply.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Planning-and-Development/Zoning/Zoning-Permitting", checkedOn: "2026-11-15" },
      { text: "Development Ordinance Section 12-3: a Zoning Compliance Permit is required before a building is erected, altered or enlarged. Section 12-4: if the lot has a septic system or well, Cabarrus Health Alliance approval comes before zoning and building permits.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Planning-and-Development/Zoning/Zoning-Permitting", checkedOn: "2026-11-15" },
      { text: "County Planning and Zoning fee schedule (approved April 22, 2025, effective July 1, 2025): Residential Addition Permit $225, Residential Accessory Structure Permit $225, Accessory Structure with Living Space $275, Residential Certificate of Occupancy zoning inspection $150. Development begun without the right permits has its fees doubled. These are zoning fees and do not include building permit fees.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Planning/Zoning-Division", checkedOn: "2026-11-15" },
      { text: "The county's zoning FAQ says a plot plan of the property with the proposed improvements must be submitted for zoning permitting. Setbacks, impervious area, water buffers, watershed and floodplain standards are reviewed from it. Setbacks are measured from the road right-of-way, not the edge of pavement.", sourceUrl: "https://cabarruscounty.us/Government/Departments/Planning/Zoning-Division/ZoningEnforcement-FAQ", checkedOn: "2026-11-15" },
      { text: "The county's zoning FAQ says a zoning permit is required for a shed, carport, garage or gazebo, and that building permits may also be needed depending on the size of the structure. Cabarrus Health Alliance approval is required before a zoning permit for projects such as additions and accessory buildings on lots with septic.", sourceUrl: "https://cabarruscounty.us/Government/Departments/Planning/Zoning-Division/ZoningEnforcement-FAQ", checkedOn: "2026-11-15" },
      { text: "The county's Development Ordinance applies only to unincorporated Cabarrus County. For a property in a municipality or its extra-territorial jurisdiction (for example Concord or Kannapolis), the town's own development rules apply.", sourceUrl: "https://cabarruscounty.us/Government/Departments/Planning/Zoning-Division/ZoningEnforcement-FAQ", checkedOn: "2026-11-15" },
      { text: "Stated residential plan review time conflicts between county documents: 5-7 business days on the Plan Review page, 2-5 business days in the Plan Review Instructions PDF. Other departments' reviews can affect total time.", sourceUrl: "https://www.cabarruscounty.us/files/assets/public/planning-and-development/construction-standards/documents/plan-review-instructions.pdf", checkedOn: "2026-11-15" },
      { text: "Inspections: text SCHEDULE to 888-365-1710, email inspections@cabarruscounty.us, or leave a voicemail at 704-920-2128.", sourceUrl: "https://www.cabarruscounty.us/files/assets/public/v/1/construction-standards/documents/homeowners-permit-guide.pdf", checkedOn: "2026-11-15" },
    ],
  },
  union: {
    id: "union",
    name: "Union County, NC",
    coverage: "directory",
    officeLabel: "Union County Building Code Enforcement",
    officeUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement",
    note: "Online plan review and permitting is at ucinspect.unioncountync.gov.",
    facts: [
      { text: "A new building code enforcement fee schedule took effect August 1, 2025. Amounts are in the county's downloadable fee schedule.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-15" },
      { text: "The county aims to complete inspections typically the day requested.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-15" },
    ],
  },
  robeson: {
    id: "robeson",
    name: "Robeson County, NC",
    coverage: "directory",
    officeLabel: "Robeson County Community Development (Planning, Building, Code Enforcement)",
    officeUrl: "https://www.robesoncountync.gov/departments/community-development/",
    officePhone: "910-272-6540",
    officeAddress: "701 N. Elm Street, Lumberton, NC 28358",
    note: "Pembroke is a town inside Robeson County. Whether the town or the county handles its permits is not confirmed. Zoning office: 910-272-6521.",
    facts: [
      { text: "The county department issues building, electrical, plumbing, mechanical and other permits, and also issues zoning permits.", sourceUrl: "https://www.robesoncountync.gov/departments/community-development/", checkedOn: "2026-11-15" },
      { text: "Permits cannot be issued after 4:00 pm. Inspections line: 910-272-6540.", sourceUrl: "https://www.robesoncountync.gov/departments/community-development/", checkedOn: "2026-11-15" },
    ],
  },
};

export const DEFAULT_JURISDICTION: JurisdictionId = "mecklenburg";

export interface Rule {
  id: string;
  jurisdiction: JurisdictionId;
  checkedOn: string; // YYYY-MM-DD, the last day this rule was checked against its source
  kind: "step" | "question"; // "question" = an open item that needs an agency answer
  projects: ProjectType[];
  where: "city" | "county"; // "city" = only inside Charlotte city limits; "county" = whole county
  title: string;
  statedTime: string;
  sourceLabel: string;
  sourceUrl: string;
  status: Status;
  note: string;
}

export const PROJECT_LABELS: Record<ProjectType, string> = {
  deck: "Deck",
  addition: "Room addition",
  garage: "Detached garage",
  trade: "Trade work (electrical, plumbing, HVAC)",
};

export const STATUS_LABELS: Record<Status, string> = {
  verified: "Verified",
  partly: "Partly verified",
  likely: "Likely, confirm",
  unverified: "Not confirmed",
};

const CITY_ZONING_PERMITTING =
  "https://charlottenc.gov/planning/ZoningAdministration/Pages/Zoning%20Permitting.aspx";
const CITY_GUIDE =
  "https://www.charlottenc.gov/files/sharedassets/city/v/1/growth-and-development/getting-started/documents/zoning/applicant-guide-ldirl.pdf";
const CITY_PAGE =
  "https://www.charlottenc.gov/Growth-and-Development/Getting-Started-on-Your-Project/Individual-Residential-Lot-Reviews";
const COUNTY_PLAN_REVIEW = "https://code.mecknc.gov/service/residential-plan-review-services";
const COUNTY_PERMITTING = "https://code.mecknc.gov/permitting";
const COUNTY_ACA = "https://code.mecknc.gov/customer-tools/aca";
const COUNTY_RPR = "https://code.mecknc.gov/plan-review/residential";
const COUNTY_SITE = "https://code.mecknc.gov";
const REBIC_2023 = "https://rebic.com/two-for-tuesday-may-2-2023";

const CITY_TIMES =
  "3 business days for the gateway check, 7 for review, 7 per follow-up review";
const COUNTY_AVG = "Typically averages about 3 weeks, first come first served";

export const RULES: Rule[] = [
  {
    id: "R1",
    jurisdiction: "mecklenburg",
    checkedOn: "2026-11-13",
    kind: "step",
    projects: ["deck"],
    where: "city",
    title: "City lot review (drainage, trees, zoning)",
    statedTime: CITY_TIMES,
    sourceLabel: "City of Charlotte, Zoning: Permitting (list of projects needing the city LDIRL); Individual Residential Lot Reviews (times)",
    sourceUrl: CITY_ZONING_PERMITTING,
    status: "verified",
    note: "The city lists Deck among the projects that need the city LDIRL permit in addition to the county building permit, with no size or height threshold. For a deck, attached or detached, the city asks for a Plot Plan. The plot plan must be to scale, and it may be hand drawn.",
  },
  {
    id: "R2",
    jurisdiction: "mecklenburg",
    checkedOn: "2026-11-12",
    kind: "step",
    projects: ["deck"],
    where: "county",
    title: "County building permit",
    statedTime: COUNTY_AVG + " (if plan review applies)",
    sourceLabel: "Mecklenburg Code Enforcement, residential plan review; CIRC email, Nov 2026",
    sourceUrl: COUNTY_PLAN_REVIEW,
    status: "partly",
    note: "The 3-week average is from the county’s written reply. Whether a deck goes through plan review is not confirmed.",
  },
  {
    id: "R3",
    jurisdiction: "mecklenburg",
    checkedOn: "2026-11-12",
    kind: "step",
    projects: ["deck"],
    where: "county",
    title: "County plan review: a stand-alone deck is not on the county’s list",
    statedTime: "Not applicable if plan review is not required",
    sourceLabel: "Mecklenburg Code Enforcement, Residential Plan Review",
    sourceUrl: COUNTY_RPR,
    status: "partly",
    note: "The county’s plan review list excludes decks and screen porches from its enclosed-addition trigger and does not name decks otherwise. That is not a statement that decks need no permit or inspection. Converting a deck into an enclosed room does trigger plan review. Confirm with the county.",
  },
  {
    id: "R4",
    jurisdiction: "mecklenburg",
    checkedOn: "2026-11-12",
    kind: "step",
    projects: ["deck", "addition", "garage", "trade"],
    where: "county",
    title: "Permit exemption: work costing $40,000 or less may not need a permit",
    statedTime: "Not a review step. A dollar threshold.",
    sourceLabel: "Mecklenburg Code Enforcement, Permitting page",
    sourceUrl: COUNTY_PERMITTING,
    status: "verified",
    note: "Does not apply if the work adds or changes load-bearing structures, plumbing, heating or air conditioning, or electrical systems, uses materials not permitted by code, or adds roofing. A deck is likely load-bearing, so expect a permit. Confirm for your project.",
  },
  {
    id: "R5",
    jurisdiction: "mecklenburg",
    checkedOn: "2026-11-13",
    kind: "step",
    projects: ["addition"],
    where: "city",
    title: "City lot review (drainage, trees, zoning)",
    statedTime: CITY_TIMES,
    sourceLabel: "City of Charlotte, Zoning: Permitting; Individual Residential Lot Reviews",
    sourceUrl: CITY_ZONING_PERMITTING,
    status: "verified",
    note: "The city lists Addition among the projects that need the city LDIRL permit in addition to the county building permit, with no minimum size. The city asks for a Plot Plan and Plans with Building Elevations.",
  },
  {
    id: "R6",
    jurisdiction: "mecklenburg",
    checkedOn: "2026-11-12",
    kind: "step",
    projects: ["addition"],
    where: "county",
    title: "County plan review",
    statedTime: COUNTY_AVG,
    sourceLabel: "Mecklenburg Residential Plan Review; CIRC email, Nov 2026",
    sourceUrl: COUNTY_RPR,
    status: "verified",
    note: "Plan review applies to an enclosed addition that adds 100 sq. ft. or more to the footprint, and to an added story. Smaller additions: confirm with the county. The county’s page states a goal of 7 days on average after acceptance, which differs from the 3-week average CIRC reported. The 3 weeks is an average, not a guarantee.",
  },
  {
    id: "R7",
    jurisdiction: "mecklenburg",
    checkedOn: "2026-11-13",
    kind: "step",
    projects: ["garage"],
    where: "city",
    title: "City lot review (drainage, trees, zoning)",
    statedTime: CITY_TIMES,
    sourceLabel: "City of Charlotte, Zoning: Permitting; Individual Residential Lot Reviews",
    sourceUrl: CITY_ZONING_PERMITTING,
    status: "verified",
    note: "The city lists Garage, and detached accessory structures over 12 feet in any dimension, among the projects that need the LDIRL. A one-story garage needs a Plot Plan, a Building Height Form and an Accessory Structure or ADU Declaration. A two-story garage needs a Site Plan (not hand drawn), Plans with Building Elevations and the declaration.",
  },
  {
    id: "R8",
    jurisdiction: "mecklenburg",
    checkedOn: "2026-11-12",
    kind: "step",
    projects: ["trade"],
    where: "county",
    title: "County trade permits (electrical, plumbing, HVAC)",
    statedTime: "Quick online for simple equipment changes (per county)",
    sourceLabel: "Mecklenburg Code Enforcement site",
    sourceUrl: COUNTY_SITE,
    status: "partly",
    note: "The county says separate permits are required for building, electrical, heating and air conditioning, and plumbing work. Details and exceptions are not confirmed.",
  },
  {
    id: "R9",
    jurisdiction: "mecklenburg",
    checkedOn: "2026-11-13",
    kind: "step",
    projects: ["deck", "addition", "garage"],
    where: "city",
    title: "City LDIRL must be approved before the county approves; both can be filed together",
    statedTime: "City review about 15 days if complete (3 business-day gateway, 7 business-day review)",
    sourceLabel: "City of Charlotte, LDIRL Applicant Guide",
    sourceUrl: CITY_GUIDE,
    status: "verified",
    note: "The city says the city and county applications are independent and can be submitted together, but you must receive city approval before county approval. The city also reviews the county permit and disapproves it if there is no LDIRL or the county plans do not match. After approval the city releases its holds on the county permit, so city delays can hold up the county permit (REBIC, May 2026). The city’s Development Center page adds that the LDIRL must be approved before the city releases its hold in the county system, and that the county then does a cursory check that the plans match the approved LDIRL.",
  },
  {
    id: "R10",
    jurisdiction: "mecklenburg",
    checkedOn: "2026-11-12",
    kind: "step",
    projects: ["garage"],
    where: "county",
    title: "County building permit (plan review only for multi-story garages or garages with living space)",
    statedTime: COUNTY_AVG + " (if plan review applies)",
    sourceLabel: "Mecklenburg Residential Plan Review",
    sourceUrl: COUNTY_RPR,
    status: "verified",
    note: "The county lists new multi-story detached garages and any garage with living space for plan review. A one-story detached garage with no living space is not on the list. It still needs a permit. Confirm with the county.",
  },
  {
    id: "R11",
    jurisdiction: "mecklenburg",
    checkedOn: "2026-11-12",
    kind: "step",
    projects: ["addition", "garage"],
    where: "county",
    title: "Submittal is checked for completeness before review starts",
    statedTime: "Review goal of 7 days on average after acceptance (one- and two-family)",
    sourceLabel: "Mecklenburg Residential Plan Review",
    sourceUrl: COUNTY_RPR,
    status: "verified",
    note: "Plans are checked against the submittal requirements before acceptance. If information is missing, the county emails what is needed. The review clock starts at acceptance, so time before acceptance is not in the stated time.",
  },
  {
    id: "R12",
    jurisdiction: "mecklenburg",
    checkedOn: "2026-11-12",
    kind: "step",
    projects: ["addition", "garage"],
    where: "county",
    title: "Re-review fee after three building review cycles",
    statedTime: "$145 per hour",
    sourceLabel: "Mecklenburg Residential Plan Review",
    sourceUrl: COUNTY_RPR,
    status: "verified",
    note: "The county says projects reviewed three or more cycles in the building discipline incur an hourly review fee of $145. Check the fee ordinance for details.",
  },
  {
    id: "R13",
    jurisdiction: "mecklenburg",
    checkedOn: "2026-11-13",
    kind: "step",
    projects: ["deck", "addition", "garage"],
    where: "city",
    title: "County plans must match the approved city LDIRL",
    statedTime: "Not a review step",
    sourceLabel: "City of Charlotte, LDIRL Applicant Guide",
    sourceUrl: CITY_GUIDE,
    status: "verified",
    note: "If the approved county plans differ from the LDIRL, the city says a new LDIRL must be submitted. A change made during county review can therefore send you back through the city review.",
  },
  {
    id: "R14",
    jurisdiction: "mecklenburg",
    checkedOn: "2026-11-13",
    kind: "step",
    projects: ["deck", "addition", "garage"],
    where: "city",
    title: "City lot review fees (fiscal 2027)",
    statedTime: "Due when the application passes the gateway",
    sourceLabel: "City of Charlotte, FY2027 Individual Residential Lot Fee Schedule",
    sourceUrl: "https://www.charlottenc.gov/files/sharedassets/city/v/1/growth-and-development/documents/dev-center-fees/fee-schedules/irl-fee-schedule.pdf",
    status: "verified",
    note: "Zoning $155. Stormwater $55 for additions, decks, sheds and detached structures. Urban forestry $180 (Tier 1) or $350 (Tier 2). A stand-alone detached garage is not clearly listed. The fee schedule is for projects passing gateway July 1, 2026 to June 30, 2027.",
  },
];

export function rulesFor(
  project: ProjectType,
  location: Location,
  jurisdiction: JurisdictionId = DEFAULT_JURISDICTION
): Rule[] {
  return RULES.filter(
    (r) =>
      r.jurisdiction === jurisdiction &&
      r.projects.includes(project) &&
      (r.where === "county" || location === "city")
  );
}

// Statewide rules. These come from North Carolina statutes and apply in every county.
// A county can be stricter in some cases, so each rule says so where the statute allows it.
export interface StateRule {
  id: string;
  checkedOn: string;
  title: string;
  summary: string;
  sourceLabel: string;
  sourceUrl: string;
  status: "verified" | "partly";
  note?: string;
}

export const STATE_RULES: StateRule[] = [
  {
    id: "S1",
    checkedOn: "2026-11-15",
    title: "A building permit expires if work does not start, or stops",
    summary:
      "A permit expires six months after it is issued if the work has not started. If work starts and then stops for 12 months, the permit expires immediately. No work may continue under an expired permit until a new one is secured.",
    sourceLabel: "N.C. Gen. Stat. 160D-1111, Expiration of building permits",
    sourceUrl: "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_160D/GS_160D-1111.html",
    status: "verified",
    note: "The statute lets a county set a shorter time than six months, so check your county's own limit.",
  },
  {
    id: "S2",
    checkedOn: "2026-11-15",
    title: "A general contractor license is needed at $40,000 or more",
    summary:
      "A person or firm who builds or manages work costing $40,000 or more for a fee must hold a North Carolina general contractor license.",
    sourceLabel: "N.C. Gen. Stat. 87-1, Definition; exempt from provisions",
    sourceUrl: "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_87/GS_87-1.html",
    status: "verified",
  },
  {
    id: "S3",
    checkedOn: "2026-11-15",
    title: "Owners building their own home",
    summary:
      "The license requirement does not apply to an owner who builds or alters a building on their own land if it is intended solely for their own and their family's occupancy and they follow G.S. 87-14. If the building is not occupied solely by the owner for at least 12 months after completion, the law presumes it was not intended for their own occupancy. G.S. 87-14 also requires the owner to sign an affidavit and personally superintend the work.",
    sourceLabel: "N.C. Gen. Stat. 87-1(b)(2) and 87-14",
    sourceUrl: "https://www.ncleg.gov/EnactedLegislation/Statutes/PDF/ByArticle/Chapter_87/Article_1.pdf",
    status: "verified",
    note: "Counties publish their own owner affidavit form.",
  },
  {
    id: "S4",
    checkedOn: "2026-11-15",
    title: "Lien agent for larger projects",
    summary:
      "The owner must designate a lien agent when the improvements cost $40,000 or more. The statute exempts improvements to an existing single-family home that the owner lives in, including adding an accessory building for that home.",
    sourceLabel: "N.C. Gen. Stat. 44A-11.1, Designation of lien agent",
    sourceUrl: "https://house.ncleg.gov/EnactedLegislation/Statutes/PDF/BySection/Chapter_44A/GS_44A-11.1.pdf",
    status: "partly",
    note: "Some county pages still say $30,000. The statute text read here says $40,000. Confirm the current amount with your county before relying on it.",
  },
];
