// Permivo rules data.
// Every rule links to a source and carries a verification status.
// Only mark a rule "verified" when an official county or city page, or a written
// agency reply, supports it. Third-party guides are leads, not sources.
// Keep real addresses and personal data out of this public repository.
// Last updated: November 16, 2026, after the second written reply from Mecklenburg County CIRC and the Cabarrus County research.

export type ProjectType = "deck" | "addition" | "garage" | "trade";
export type Location = "city" | "outside";
export type Status = "verified" | "partly" | "likely" | "unverified";
export type JurisdictionId = "mecklenburg" | "catawba" | "cabarrus" | "union" | "robeson"; // add an id here when a new place is added

export interface Jurisdiction {
  id: JurisdictionId;
  name: string;
  // "verified" = rules checked against official sources with dates.
  // "partial" = rules and checklist are shown with their own statuses, but key answers are still pending.
  // "directory" = only the office and how to reach it, no verified rules yet.
  coverage: "verified" | "partial" | "directory";
  // Planner wording for the two location choices, and which one starts selected.
  locationLabels?: { city: string; outside: string };
  defaultLocation?: Location;
  // Who the user should confirm with. Shown in the planner banner.
  confirmWith?: string;
  // Shown for coverage "partial": what is still waiting on the agency.
  partialNote?: string;
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
    locationLabels: { city: "Inside Charlotte city limits", outside: "Elsewhere in the county" },
    defaultLocation: "city",
    confirmWith: "Mecklenburg County Code Enforcement and the City of Charlotte",
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
      { text: "For a licensed general contractor building an accessory building, the county lists these documents: a Building Permit Application, water and sewer or septic and well approval, an Erosion Control Affidavit, and zoning permit approval. Alterations need a Building Permit Application, water and sewer or septic and well approval, a Workers' Compensation Affidavit and zoning approval. Whether a deck or addition falls under Alterations or another type is not stated.", sourceUrl: "https://www.catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/for-licensed-general-contractors/", checkedOn: "2026-11-16" },
      { text: "The county advises submitting all approvals, applications and forms at once to avoid delays.", sourceUrl: "https://www.catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/for-licensed-general-contractors/", checkedOn: "2026-11-16" },
      { text: "A Designation of Lien Agent is listed for manufactured home, modular and single family dwelling projects. It is not listed for accessory buildings or alterations on that page.", sourceUrl: "https://www.catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/for-licensed-general-contractors/", checkedOn: "2026-11-16" },
      { text: "County plan review covers commercial projects. For residential work, townhouses require a full plan review and duplexes get a counter review for tenant separation. Decks, additions and garages are not mentioned. All plans are reviewed electronically in ePermits.", sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/plan-review/", checkedOn: "2026-11-16" },
      { text: "For septic or wells, the county directs applicants to its Environmental Health Department for approval before the building permit.", sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/", checkedOn: "2026-11-16" },
    ],
  },
  cabarrus: {
    id: "cabarrus",
    name: "Cabarrus County, NC",
    coverage: "partial",
    officeLabel: "Cabarrus County Construction Standards",
    officeUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access",
    officePhone: "704-920-2128",
    officeEmail: "construction2222@cabarruscounty.us",
    officeAddress: "65 Church St S, Concord, NC 28025",
    locationLabels: { city: "Inside a town (Concord, Kannapolis, others)", outside: "Unincorporated Cabarrus County" },
    defaultLocation: "outside",
    confirmWith: "Cabarrus County Construction Standards (704-920-2128), the county Zoning office (704-920-2141), or your town's planning office",
    partialNote: "Cabarrus County is partly verified. Its zoning steps and fees come from county pages. Whether a stand-alone deck, addition or garage needs plan review, the order of the zoning and building steps, and building permit fees are still waiting on the county's written answer.",
    note: "Zoning is a separate county office (704-920-2141) and covers unincorporated Cabarrus County only. Properties inside Concord, Kannapolis and other towns follow the town's own rules.",
    facts: [
      { text: "The county says a zoning permit is needed for additions, accessory structures such as a garage or storage building, and for installing or adding on to a deck or patio.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Planning-and-Development/Zoning/Zoning-Permitting", checkedOn: "2026-11-15" },
      { text: "Permits are tracked in the county's Accela portal. The county's permit form lists decks under both Addition and Accessory Structure permit types.", sourceUrl: "https://www.cabarruscounty.us/files/assets/public/v/1/construction-standards/documents/homeowners-permit-guide.pdf", checkedOn: "2026-11-15" },
      { text: "A lien filing is required for projects of $30,000 or more.", sourceUrl: "https://www.cabarruscounty.us/files/assets/public/v/1/construction-standards/documents/homeowners-permit-guide.pdf", checkedOn: "2026-11-15" },
      { text: "Residential building permits for accessory structures (such as a detached garage) and additions (such as a deck, room or screened porch) are applied for online in Accela.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access", checkedOn: "2026-11-15" },
      { text: "The county's plan review page says plan review is for all new primary residences and all new and renovation commercial projects. Decks, additions and garages are not named. Residential reviews take 5-7 business days depending on zoning.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Plan-Review", checkedOn: "2026-11-15" },
      { text: "Plan review files must be PDFs, with building and site reviews submitted separately and different document types not combined in one PDF.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Plan-Review", checkedOn: "2026-11-15" },
      { text: "Development Ordinance (copy with amendments through January 2022, so confirm it is current), Section 6-14: an uncovered, unenclosed deck, terrace or patio may extend into a required setback, but never closer than 5 feet to any property line.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Planning-and-Development/Zoning/Zoning-Permitting", checkedOn: "2026-11-15" },
      { text: "Development Ordinance Section 7-3 (copy with amendments through January 2022): an accessory building up to 15 feet tall must meet the house's front and side setbacks, with a rear setback of at least 5 feet. Taller buildings must meet the house's setbacks. Impervious and structural coverage limits also apply.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Planning-and-Development/Zoning/Zoning-Permitting", checkedOn: "2026-11-15" },
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
    officePhone: "704-283-3816",
    officeEmail: "ucinspections@unioncountync.gov",
    officeAddress: "500 N. Main St., Suite 47, Monroe, NC 28112",
    note: "Online plan review and permitting is at ucinspect.unioncountync.gov.",
    facts: [
      { text: "A new building code enforcement fee schedule took effect August 1, 2025. Amounts are in the county's downloadable fee schedule.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-15" },
      { text: "The county aims to complete inspections typically the day requested.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-15" },
      { text: "Residential and commercial building permits, including accessory structures, are applied for online at the county's online plan review and permitting service. An account is required to apply and to schedule inspections.", sourceUrl: "https://ucinspect.unioncountync.gov/evolvepublic/", checkedOn: "2026-11-16" },
      { text: "The online service also handles electrical, HVAC, gas and plumbing permits, and zoning compliance for new businesses.", sourceUrl: "https://ucinspect.unioncountync.gov/evolvepublic/", checkedOn: "2026-11-16" },
      { text: "The county's commercial submittal requirements say zoning approval is required for commercial applications. Whether it applies to residential work is not stated.", sourceUrl: "https://www.unioncountync.gov/home/showpublisheddocument/686/639106393738170000", checkedOn: "2026-11-16" },
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
  where: "city" | "county" | "outside"; // "city" = only inside a city or town; "outside" = only outside one; "county" = everywhere in the county
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
const COUNTY_TOTAL =
  "About 3 weeks for the whole county process (intake, review, zoning approval, permitting). Review itself is about 7 days after acceptance.";
const COUNTY_DECK_DOCS = "https://mecknc.widen.net/s/6srfhqzn5z/deck-brochure";
const COUNTY_ACCESSORY_GUIDE = "https://mecknc.widen.net/s/n2wcpjhbm6/aca-submitting-a-residential-accessory-structure-application";
const COUNTY_ADDITION_GUIDE = "https://mecknc.widen.net/s/lxvdhvmrgd/aca-submitting-a-residential-addition-application";
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
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["deck"],
    where: "county",
    title: "County building permit and inspections (no plan review)",
    statedTime: COUNTY_TOTAL,
    sourceLabel: "Mecklenburg Code Enforcement written reply, Nov 2026; county Deck Brochure and AccelaMeck guides",
    sourceUrl: COUNTY_ADDITION_GUIDE,
    status: "verified",
    note: "The county confirmed in writing that a stand-alone deck, or a deck or screen porch addition, needs a building permit and inspections. It is submitted through AccelaMeck, the county's online system, and does not go through plan review. The county says to allow at least three weeks for the whole process: intake, review, zoning approval and permitting.",
  },
  {
    id: "R3",
    jurisdiction: "mecklenburg",
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["deck"],
    where: "county",
    title: "County plan review is not required for a deck",
    statedTime: "Not applicable. Plan review is not required for a deck.",
    sourceLabel: "Mecklenburg Code Enforcement written reply, Nov 2026; Residential Plan Review",
    sourceUrl: COUNTY_DECK_DOCS,
    status: "verified",
    note: "The county's plan review list excludes decks and screen porches from its enclosed-addition trigger, and the county confirmed in writing that decks need a building permit but not plan review. Converting a deck into an enclosed room does trigger plan review.",
  },
  {
    id: "R15",
    jurisdiction: "mecklenburg",
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["deck"],
    where: "county",
    title: "Engineer's letter only for engineered materials or non-prescriptive decks",
    statedTime: "Not a review step",
    sourceLabel: "Mecklenburg Code Enforcement written reply, Nov 2026",
    sourceUrl: COUNTY_DECK_DOCS,
    status: "verified",
    note: "The county confirmed in writing that a deck built prescriptively does not need an engineer's letter. Engineered materials or non-prescriptive methods do need one.",
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
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["addition"],
    where: "county",
    title: "County plan review",
    statedTime: COUNTY_TOTAL,
    sourceLabel: "Mecklenburg Residential Plan Review; CIRC email, Nov 2026",
    sourceUrl: COUNTY_RPR,
    status: "verified",
    note: "Plan review applies to an enclosed addition that adds 100 sq. ft. or more to the footprint, and to an added story. The county confirmed in writing that an addition of 100 sq. ft. or less needs a building permit but not plan review. The 7-day goal is the lead time for the review itself. The county says to allow at least three weeks for intake, review, zoning approval and permitting. Projects that need plan review must follow the county's plan review checklist.",
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
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["garage"],
    where: "county",
    title: "County building permit (plan review only for multi-story garages or garages with living space)",
    statedTime: COUNTY_TOTAL,
    sourceLabel: "Mecklenburg Residential Plan Review",
    sourceUrl: COUNTY_ACCESSORY_GUIDE,
    status: "verified",
    note: "The county lists new multi-story detached garages and any garage with living space for plan review. The county confirmed in writing that a one-story detached garage with no living space is a standard building permit, submitted through AccelaMeck, with no plan review.",
  },
  {
    id: "R11",
    jurisdiction: "mecklenburg",
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["addition", "garage"],
    where: "county",
    title: "Submittal is checked for completeness before review starts",
    statedTime: "Review goal of 7 days on average after acceptance (one- and two-family)",
    sourceLabel: "Mecklenburg Residential Plan Review",
    sourceUrl: COUNTY_RPR,
    status: "verified",
    note: "Plans are checked against the submittal requirements before acceptance. If information is missing, the county emails what is needed. The review clock starts at acceptance, so time before acceptance is not in the 7-day goal. The county says whole-process time is at least three weeks.",
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

  {
    id: "C1",
    jurisdiction: "cabarrus",
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["deck"],
    where: "outside",
    title: "County zoning permit (Zoning Compliance Permit)",
    statedTime: "Not stated",
    sourceLabel: "Cabarrus County, Zoning Permitting; Development Ordinance Section 12-3",
    sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Planning-and-Development/Zoning/Zoning-Permitting",
    status: "verified",
    note: "The county says a zoning permit is needed to install or add on to a deck or patio, and the ordinance requires a Zoning Compliance Permit before a building is erected, altered or enlarged. A plot plan with the proposed work is required. The fee schedule lists addition and accessory structure permits at $225 but does not list a deck separately, so the deck fee is not confirmed.",
  },

  {
    id: "C2",
    jurisdiction: "cabarrus",
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["addition"],
    where: "outside",
    title: "County zoning permit (Zoning Compliance Permit)",
    statedTime: "Not stated",
    sourceLabel: "Cabarrus County, Zoning Permitting; Planning and Zoning Fee Schedule (effective July 1, 2025)",
    sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Planning/Zoning-Division",
    status: "verified",
    note: "The county says a zoning permit is needed for additions. The fee schedule lists a Residential Addition Permit at $225. A plot plan is required. Fees double if work starts without the right permits.",
  },

  {
    id: "C3",
    jurisdiction: "cabarrus",
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["garage"],
    where: "outside",
    title: "County zoning permit (Zoning Compliance Permit)",
    statedTime: "Not stated",
    sourceLabel: "Cabarrus County, Zoning FAQ; Planning and Zoning Fee Schedule (effective July 1, 2025)",
    sourceUrl: "https://cabarruscounty.us/Government/Departments/Planning/Zoning-Division/ZoningEnforcement-FAQ",
    status: "verified",
    note: "The county's zoning FAQ says a shed, carport, garage or gazebo needs a zoning permit. The fee schedule lists a Residential Accessory Structure Permit at $225, or $275 for an accessory structure with living space. A plot plan is required.",
  },

  {
    id: "C4",
    jurisdiction: "cabarrus",
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["deck", "addition", "garage"],
    where: "city",
    title: "Town zoning review (Concord, Kannapolis and other towns)",
    statedTime: "Not stated",
    sourceLabel: "Cabarrus County, Zoning FAQ",
    sourceUrl: "https://cabarruscounty.us/Government/Departments/Planning/Zoning-Division/ZoningEnforcement-FAQ",
    status: "partly",
    note: "The county's zoning rules apply only to unincorporated Cabarrus County. Inside a town or its extra-territorial area, the town's own development rules apply, so the zoning permit comes from the town, not the county. The steps, fees and times for each town are not confirmed.",
  },

  {
    id: "C5",
    jurisdiction: "cabarrus",
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["deck"],
    where: "county",
    title: "County building permit, applied for in Accela",
    statedTime: "Not stated for decks",
    sourceLabel: "Cabarrus County, Construction Standards online access; homeowner permit guide",
    sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access",
    status: "partly",
    note: "The county applies for additions, which it describes as including a deck, room or screened porch, through Accela. Whether a stand-alone deck has any exemption, and whether it goes through plan review, is not confirmed.",
  },

  {
    id: "C6",
    jurisdiction: "cabarrus",
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["addition"],
    where: "county",
    title: "County building permit, applied for in Accela",
    statedTime: "Not stated for additions",
    sourceLabel: "Cabarrus County, Construction Standards online access",
    sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access",
    status: "partly",
    note: "Residential additions are applied for through Accela. Whether an addition goes through plan review is not confirmed.",
  },

  {
    id: "C7",
    jurisdiction: "cabarrus",
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["garage"],
    where: "county",
    title: "County building permit, applied for in Accela",
    statedTime: "Not stated for garages",
    sourceLabel: "Cabarrus County, Construction Standards online access; Zoning FAQ",
    sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access",
    status: "partly",
    note: "Accessory structures such as a detached garage are applied for through Accela. The zoning FAQ says a building permit may also be needed depending on the size of the structure, but the size line is not stated.",
  },

  {
    id: "C8",
    jurisdiction: "cabarrus",
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["deck","addition","garage"],
    where: "county",
    title: "County plan review is listed only for new primary residences and commercial projects",
    statedTime: "5-7 business days for residential reviews, depending on zoning (Plan Review page); 2-5 business days in the Plan Review Instructions PDF",
    sourceLabel: "Cabarrus County, Plan Review page and Plan Review Instructions",
    sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Plan-Review",
    status: "partly",
    note: "The county's Plan Review page says plan review is for all new primary residences and all new and renovation commercial projects. Decks, additions and detached garages are not on that list, which suggests they are a standard building permit, but the county has not said so in writing. The page says the residential review time depends on zoning, and the Instructions PDF gives a different range. When the plan review path applies, submit through Accela's Digital Plan Room: PDFs only (100 MB maximum, no encrypted files), building and site reviews submitted separately, and no new uploads in the middle of a review cycle.",
  },

  {
    id: "C9",
    jurisdiction: "cabarrus",
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["deck", "addition", "garage"],
    where: "outside",
    title: "Septic or well approval before the zoning permit",
    statedTime: "Not stated",
    sourceLabel: "Cabarrus County, Zoning FAQ; Development Ordinance Section 12-4",
    sourceUrl: "https://cabarruscounty.us/Government/Departments/Planning/Zoning-Division/ZoningEnforcement-FAQ",
    status: "verified",
    note: "If the lot has a septic system or well, Cabarrus Health Alliance approval comes before the zoning permit. The Health Alliance inspects existing septic systems for zoning and building permits for structural additions, accessory structures, accessory dwelling units, replacement mobile homes and swimming pools. Decks are not named in that list.",
  },

  {
    id: "C10",
    jurisdiction: "cabarrus",
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["deck"],
    where: "outside",
    title: "Deck setback: never closer than 5 feet to a property line",
    statedTime: "Not a review step",
    sourceLabel: "Cabarrus County Development Ordinance Section 6-14 (copy with amendments through January 2022)",
    sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Planning-and-Development/Zoning/Zoning-Permitting",
    status: "partly",
    note: "An uncovered, unenclosed deck may extend into a required setback but never closer than 5 feet to any property line. The ordinance copy checked has amendments through January 2022, so confirm it is current.",
  },

  {
    id: "C11",
    jurisdiction: "cabarrus",
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["garage"],
    where: "outside",
    title: "Detached garage setbacks and height",
    statedTime: "Not a review step",
    sourceLabel: "Cabarrus County Development Ordinance Section 7-3 (copy with amendments through January 2022)",
    sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Planning-and-Development/Zoning/Zoning-Permitting",
    status: "partly",
    note: "An accessory building up to 15 feet tall must meet the house's front and side setbacks, with a rear setback of at least 5 feet. Taller buildings must meet the house's setbacks. Setbacks are measured from the road right-of-way. Impervious and coverage limits apply. The ordinance copy checked has amendments through January 2022, so confirm it is current.",
  },

  {
    id: "C12",
    jurisdiction: "cabarrus",
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["deck", "addition", "garage"],
    where: "outside",
    title: "Zoning final inspection and its fee",
    statedTime: "Not stated",
    sourceLabel: "Cabarrus County, Planning and Zoning Fee Schedule (effective July 1, 2025)",
    sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Planning/Zoning-Division",
    status: "partly",
    note: "The fee schedule lists a $150 Certificate of Occupancy zoning inspection for residential work. One permit record seen also showed a zoning final inspection as required. Whether every deck, addition or garage needs it is not confirmed.",
  },

  {
    id: "C13",
    jurisdiction: "cabarrus",
    checkedOn: "2026-11-16",
    kind: "question",
    projects: ["deck", "addition", "garage"],
    where: "county",
    title: "Open question: does a stand-alone deck, addition or garage need plan review?",
    statedTime: "Not confirmed",
    sourceLabel: "Email to Cabarrus County, Nov 2026 (reply pending)",
    sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access",
    status: "unverified",
    note: "The county's Plan Review page lists only new primary residences and commercial projects, so a deck, addition or garage is likely a standard building permit. Asked of Construction Standards for a written answer. Until the county confirms, treat this as not confirmed.",
  },

  {
    id: "C14",
    jurisdiction: "cabarrus",
    checkedOn: "2026-11-16",
    kind: "question",
    projects: ["deck", "addition", "garage"],
    where: "county",
    title: "Open question: which comes first, the zoning permit or the building permit?",
    statedTime: "Not confirmed",
    sourceLabel: "Email to Cabarrus County, Nov 2026 (reply pending)",
    sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access",
    status: "unverified",
    note: "No county page states the order. The septic and well approval is stated to come before the zoning permit.",
  },

  {
    id: "C15",
    jurisdiction: "cabarrus",
    checkedOn: "2026-11-16",
    kind: "question",
    projects: ["deck", "addition", "garage"],
    where: "county",
    title: "Open question: building permit fees",
    statedTime: "Not confirmed",
    sourceLabel: "Email to Cabarrus County, Nov 2026 (reply pending)",
    sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access",
    status: "unverified",
    note: "The county's zoning fees are published. The building permit fee schedule was not found on the pages read.",
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
      (r.where === "county" ||
        (r.where === "city" && location === "city") ||
        (r.where === "outside" && location === "outside"))
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
  {
    id: "S5",
    checkedOn: "2026-11-16",
    title: "Residential plan review checklist (state guidance)",
    summary:
      "For one- and two-family homes, the State Fire Marshal's guidance describes what a local plan review should look at: drawings to scale (at least 1/8 inch) on sheets at least 11 by 17 inches with the designer's name and contact; a plot plan with building location, setbacks, easements and property lines; footing and foundation details; floor plans with room dimensions and square footage; front, side and rear elevations with heights; and floor, wall and roof framing details with loads, member sizes, spans and bracing. It says no electrical, mechanical or plumbing plans are needed for the review, and truss spec sheets are handled in the field.",
    sourceLabel: "NC Office of State Fire Marshal, Residential Plan Review Checklist Guidance (S.L. 2019-174)",
    sourceUrl: "https://ncosfm.gov/guidance-papers/sl-2019-174-residential-plan-review-checklist-guidance/open",
    status: "partly",
    note: "This is guidance for jurisdictions that choose to offer residential plan review, not a law. It says it may not reflect the latest code. Each county uses its own checklist, and it applies only to projects that go through plan review.",
  },
];
