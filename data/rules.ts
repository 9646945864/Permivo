// Permivo rules data.
// Every rule links to a source and carries a verification status.
// Only mark a rule "verified" when an official county or city page, or a written
// agency reply, supports it. Third-party guides are leads, not sources.
// Keep real addresses and personal data out of this public repository.
// Last updated: November 20, 2026, after re-reading Union and Cabarrus county pages.

export type ProjectType = "deck" | "addition" | "garage" | "trade";
export type Location = "city" | "outside";
export type Status = "verified" | "partly" | "likely" | "unverified";
export type JurisdictionId = "mecklenburg" | "catawba" | "cabarrus" | "union" | "robeson" | "wake" | "guilford" | "buncombe" | "durham" | "johnston" | "pitt"; // add an id here when a new place is added

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
  // Names of the two agencies in the planner: the city or town side and the county side.
  agencyLabels?: { city: string; county: string };
  // What the agency says about total time. min and max are in days and are optional (some counties give none).
  statedDays?: { label: string; min?: number; max?: number };
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
    agencyLabels: { city: "City of Charlotte", county: "Mecklenburg County" },
    statedDays: { label: "About 3 weeks for the county process (county written reply, Nov 2026). The city stated 3 business days for its gateway check and 7 for review.", min: 21, max: 21 },
  },
  catawba: {
    id: "catawba",
    name: "Catawba County, NC",
    coverage: "partial",
    officeLabel: "Catawba County Permit Center",
    officeUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/",
    officePhone: "828-465-8399",
    officeEmail: "permitapps@catawbacountync.gov",
    officeAddress: "25 Government Drive, Newton, NC 28658",
    locationLabels: { city: "Inside a city or town (Hickory, Conover, Newton, others)", outside: "Unincorporated Catawba County" },
    defaultLocation: "outside",
    agencyLabels: { city: "Your town's planning office", county: "Catawba County" },
    statedDays: { label: "Not stated for a standard building permit. When plan review applies it takes a few hours to 10 days (county written reply, Nov 2026)." },
    confirmWith: "Catawba County Permit Center (828-465-8399), County Zoning (828-465-8380), or your city or town planning office",
    partialNote: "Catawba County is mostly verified from the county's written reply and official pages. Still open: whether a stand-alone deck needs a zoning permit or a waiver letter, how long a standard building permit takes to issue, and which drawings a standard permit needs. Inside a town, the town's planning office issues the zoning permit.",
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
      { text: "FY27 fee schedule (effective July 1, 2026): stand-alone deck and residential accessory building $0.25 per sq ft; new residential construction $0.50 per sq ft; minimum building permit $90; residential zoning permit for additions and accessory structures $25; re-trip fee $120; work started without a permit is charged double.", sourceUrl: "https://catawbacountync.gov/site/assets/files/11750/fy27_fee_schedule.pdf", checkedOn: "2026-11-18" },
      { text: "FY27 fee schedule: existing structure alterations are $90 up to $5,000, then $90 plus $3 per additional thousand to $100,000. Plan review minimum $90; alterations plan review $0.04 per sq ft; resubmittals are free the first time, half the fee the second time and the full fee the third and fourth times.", sourceUrl: "https://catawbacountync.gov/site/assets/files/11750/fy27_fee_schedule.pdf", checkedOn: "2026-11-18" },
      { text: "Inspections are scheduled for the following workday, or the next available day if full. Request them in ePermits or by phone at 828-465-8399. Building and trade contractors who have worked with the office in the past five years need an access code from the Permit Center.", sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/", checkedOn: "2026-11-18" },
      { text: "The county's contractor page still says a general contractor's license is required above $30,000, but the county confirmed in writing in Nov 2026 that its threshold is $40,000, which matches state law (G.S. 87-1).", sourceUrl: "https://www.catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/for-unlicensed-general-contractors/", checkedOn: "2026-11-18" },
      { text: "An owner acting as general contractor must have the property in their own name, and it cannot be rented, leased or sold for one year after the project is completed.", sourceUrl: "https://www.catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/for-owner-acting-as-the-general-contractor/", checkedOn: "2026-11-18" },
      { text: "County permit process order, per the county's process chart and page: obtain zoning approval, then water and sewer or well and septic approvals, then complete prerequisite forms, then submit the application packet to the Permit Center, then application review and payment, then permits are issued. The county says each project is unique and may have additional steps.", sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/", checkedOn: "2026-11-18" },
      { text: "The county's Building Services Division does inspections in the unincorporated areas and for the eight municipalities: Brookford, Catawba, Claremont, Conover, Hickory, Long View, Newton and Maiden.", sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/", checkedOn: "2026-11-18" },
      { text: "During peak months the county asks applicants to allow additional time for permit processing. Payments by check, debit card and credit card (Visa and MasterCard only) are accepted. The Permit Center takes in-person applications and payments Monday to Friday, 8:00 a.m. to 5:00 p.m.", sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/", checkedOn: "2026-11-18" },
      { text: "FY27 fee schedule also lists: administrative fee $30, change of contractor $30, after-hours inspections $105 per hour, and a $10 Homeowners Recovery Fund fee for single family units. A workers' compensation affidavit form is linked on the county page.", sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/", checkedOn: "2026-11-18" },
      { text: "Written reply from Catawba County, Nov 2026: plan review for residential property is only required for metal framed or metal truss structures, post and beam construction, or a change from residential to commercial use. It needs sealed engineered drawings and takes anywhere from a few hours to 10 days.", sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/", checkedOn: "2026-11-18" },
      { text: "Written reply from Catawba County, Nov 2026: additions onto homes are $0.50 per sq ft, and alterations inside an existing structure are also charged by the cost of the work.", sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/", checkedOn: "2026-11-18" },
      { text: "Written reply from Catawba County, Nov 2026: residential building permits are valid for 6 months without inspections. After any passed or failed inspection, the expiration is extended to one year from the most recent inspection.", sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/", checkedOn: "2026-11-18" },
      { text: "Written reply from Catawba County, Nov 2026: decks always need a building permit. Accessory structures need no building permit if they are 12 by 12 feet or smaller, but still need a zoning permit and Environmental Health approval if a septic system or well is on the property. If any side exceeds 12 feet, a building permit is required.", sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/", checkedOn: "2026-11-18" },
      { text: "Written reply from Catawba County, Nov 2026: building permits are always issued by the county, and municipalities issue zoning permits for residential properties.", sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/", checkedOn: "2026-11-18" },
      { text: "Written reply from Catawba County, Nov 2026: the county's cost threshold for a general contractor's license is $40,000.", sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/", checkedOn: "2026-11-18" },
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
    agencyLabels: { city: "Your town's planning office", county: "Cabarrus County" },
    statedDays: { label: "Residential can take 2 to 5 weeks, depending on the project and how each department and zoning jurisdiction reviews it (county written reply, Nov 2026).", min: 14, max: 35 },
    confirmWith: "Cabarrus County Construction Standards (704-920-2128), the county Zoning office (704-920-2141), or your town's planning office",
    partialNote: "Cabarrus County is partly verified. The county confirmed in writing that a deck, addition and detached garage need a standard building permit with no plan review, and that zoning comes first. Building permit fee rates, the drawings the county wants, whether an engineer's letter is needed, the size line for small accessory buildings and the lien amount are still open. Inside a town, the town sets zoning.",
    note: "Zoning is a separate county office (704-920-2141) and covers unincorporated Cabarrus County only. Properties inside Concord, Kannapolis and other towns follow the town's own rules.",
    facts: [
      { text: "The county says a zoning permit is needed for additions, accessory structures such as a garage or storage building, and for installing or adding on to a deck or patio.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Planning-and-Development/Zoning/Zoning-Permitting", checkedOn: "2026-11-15" },
      { text: "Permits are tracked in the county's Accela portal. The county's permit form lists decks under both Addition and Accessory Structure permit types.", sourceUrl: "https://www.cabarruscounty.us/files/assets/public/v/1/construction-standards/documents/homeowners-permit-guide.pdf", checkedOn: "2026-11-15" },
      { text: "A lien filing is required for projects of $30,000 or more.", sourceUrl: "https://www.cabarruscounty.us/files/assets/public/v/1/construction-standards/documents/homeowners-permit-guide.pdf", checkedOn: "2026-11-15" },
      { text: "Residential building permits for accessory structures (such as a detached garage) and additions (such as a deck, room or screened porch) are applied for online in Accela.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access", checkedOn: "2026-11-15" },
      { text: "The county's plan review page says plan review is for all new primary residences and all new and renovation commercial projects. Decks, additions and garages are not named. Residential reviews take 5-7 business days depending on zoning. The county later confirmed in writing that a deck, addition and detached garage do not go through plan review.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Plan-Review", checkedOn: "2026-11-15" },
      { text: "Plan review files must be PDFs, with building and site reviews submitted separately and different document types not combined in one PDF.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Plan-Review", checkedOn: "2026-11-15" },
      { text: "Development Ordinance (copy with amendments through January 2022, so confirm it is current), Section 6-14: an uncovered, unenclosed deck, terrace or patio may extend into a required setback, but never closer than 5 feet to any property line.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Planning-and-Development/Zoning/Zoning-Permitting", checkedOn: "2026-11-15" },
      { text: "Development Ordinance Section 7-3 (copy with amendments through January 2022): an accessory building up to 15 feet tall must meet the house's front and side setbacks, with a rear setback of at least 5 feet. Taller buildings must meet the house's setbacks. Impervious and structural coverage limits also apply.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Planning-and-Development/Zoning/Zoning-Permitting", checkedOn: "2026-11-15" },
      { text: "Development Ordinance Section 12-3: a Zoning Compliance Permit is required before a building is erected, altered or enlarged. Section 12-4: if the lot has a septic system or well, Cabarrus Health Alliance approval comes before zoning and building permits.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Planning-and-Development/Zoning/Zoning-Permitting", checkedOn: "2026-11-15" },
      { text: "County Planning and Zoning fee schedule (approved April 22, 2025, effective July 1, 2025): Residential Addition Permit $225, Residential Accessory Structure Permit $225, Accessory Structure with Living Space $275, Residential Certificate of Occupancy zoning inspection $150. Development begun without the right permits has its fees doubled. These are zoning fees and do not include building permit fees.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Planning/Zoning-Division", checkedOn: "2026-11-15" },
      { text: "The county's zoning FAQ says a plot plan of the property with the proposed improvements must be submitted for zoning permitting. Setbacks, impervious area, water buffers, watershed and floodplain standards are reviewed from it. Setbacks are measured from the road right-of-way, not the edge of pavement.", sourceUrl: "https://cabarruscounty.us/Government/Departments/Planning/Zoning-Division/ZoningEnforcement-FAQ", checkedOn: "2026-11-15" },
      { text: "The county's zoning FAQ says a zoning permit is required for a shed, carport, garage or gazebo, and that building permits may also be needed depending on the size of the structure. Cabarrus Health Alliance approval is required before a zoning permit for projects such as additions and accessory buildings on lots with septic.", sourceUrl: "https://cabarruscounty.us/Government/Departments/Planning/Zoning-Division/ZoningEnforcement-FAQ", checkedOn: "2026-11-15" },
      { text: "The county's Development Ordinance applies only to unincorporated Cabarrus County. For a property in a municipality or its extra-territorial jurisdiction (for example Concord or Kannapolis), the town's own development rules apply.", sourceUrl: "https://cabarruscounty.us/Government/Departments/Planning/Zoning-Division/ZoningEnforcement-FAQ", checkedOn: "2026-11-15" },
      { text: "Stated residential plan review time conflicts between county documents: 5-7 business days on the Plan Review page, 2-5 business days in the Plan Review Instructions PDF. Other departments' reviews can affect total time. This applies to projects that go through plan review, which the county says does not include a deck, addition or garage.", sourceUrl: "https://www.cabarruscounty.us/files/assets/public/planning-and-development/construction-standards/documents/plan-review-instructions.pdf", checkedOn: "2026-11-15" },
      { text: "Written reply from Cabarrus County, Nov 2026: a stand-alone deck needs a building permit and inspections. A deck, a residential addition and a detached garage are standard building permits in Accela and do not need plan review.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access", checkedOn: "2026-11-17" },
      { text: "Written reply from Cabarrus County, Nov 2026: zoning approval comes first and the building permit second.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access", checkedOn: "2026-11-17" },
      { text: "Written reply from Cabarrus County, Nov 2026: building permit fees for a deck, addition and detached garage depend on square footage (no rate given). Residential permits can take anywhere from 2 to 5 weeks (commercial 8 to 12), depending on the project and on how each department and zoning jurisdiction reviews it.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access", checkedOn: "2026-11-17" },
      { text: "Inspections: text SCHEDULE to 888-365-1710, email inspections@cabarruscounty.us, or leave a voicemail at 704-920-2128.", sourceUrl: "https://www.cabarruscounty.us/files/assets/public/v/1/construction-standards/documents/homeowners-permit-guide.pdf", checkedOn: "2026-11-15" },
      { text: "County page, read November 20, 2026: during Government Center renovations the Construction Standards and Planning and Zoning offices temporarily moved to the Conference Center Lobby and Training Room A in the Milestone building, 4855 Milestone Ave, Kannapolis. Renovations were expected to finish by early October 2026, so confirm the current location by phone before visiting.", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards", checkedOn: "2026-11-20" },
      { text: "County online access page: residential building permits are submitted in Accela as an Accessory (pool, shed, detached garage, not attached to the primary structure) or an Addition (deck, room, screened porch, attached to the primary structure).", sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access", checkedOn: "2026-11-20" },
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
    note: "Online plan review and permitting is at ucinspect.unioncountync.gov. The county handles zoning only for unincorporated parcels. Properties in Indian Trail, Monroe, Stallings, Waxhaw, Weddington, Marvin and other listed towns get zoning from the town.",
    facts: [
      { text: "The county's adopted building code enforcement fee schedule took effect August 1, 2026 (the county page also lists the prior schedule, valid through July 31, 2026). The county's Planning & Development page links to adopted FY27 rates and fees.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-15" },
      { text: "The county aims to complete inspections typically the day requested.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-15" },
      { text: "Residential and commercial building permits, including accessory structures, are applied for online at the county's online plan review and permitting service. An account is required to apply and to schedule inspections.", sourceUrl: "https://ucinspect.unioncountync.gov/evolvepublic/", checkedOn: "2026-11-16" },
      { text: "The online service also handles electrical, HVAC, gas and plumbing permits, and zoning compliance for new businesses.", sourceUrl: "https://ucinspect.unioncountync.gov/evolvepublic/", checkedOn: "2026-11-16" },
      { text: "The county's commercial submittal requirements say zoning approval is required for commercial applications. Whether it applies to residential work is not stated.", sourceUrl: "https://www.unioncountync.gov/home/showpublisheddocument/686/639106393738170000", checkedOn: "2026-11-16" },
      { text: "The county's residential page says most home improvement projects require a permit, including adding, repairing or replacing load-bearing structures and changing plumbing, heating, air conditioning or electrical wiring. On November 20, 2026 the page listed water heater replacement (no change in fuel, location, capacity or venting) and like-for-like electrical devices as exempt examples. A minor-alterations exemption of $15,000 that the page showed on November 16 was not on the page on November 20, so it is not used here. Decks, garages and accessory structures are not named on that page.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement/residential", checkedOn: "2026-11-20" },
      { text: "Union County Environmental Health: existing septic system inspections are made by request and are required prior to any new construction on a property with an existing septic system, including garages, decks, swimming pools, irrigation systems and attachments to existing buildings. The county also says these inspections are performed for owners constructing additions such as bedrooms, decks, porches, detached buildings, pools or rooms outside the existing foundation.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/environmental-health/septic-systems", checkedOn: "2026-11-20" },
      { text: "Building Code Enforcement: 704-283-3816 for inspections and permit questions, fax 704-292-2513, 500 N. Main St., Suite 47, Monroe, NC 28112. The county main line is 704-283-3500. The county's lien agent threshold is $40,000 (re-read on its residential page, November 20, 2026).", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-20" },
      { text: "An older county fee schedule (revised January 2020) shows a $40 residential zoning permit and per-square-foot building fees. It has been replaced by the current schedule, so these amounts are not used here.", sourceUrl: "https://unioncountync.gov/home/showpublisheddocument/5292/637854590328200000", checkedOn: "2026-11-16" },
      { text: "How to obtain a building permit (county page): three things come first, which are water and sewer, zoning and the applicable codes. A residential permit needs a completed building permit application, available online or in the county office.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-16" },
      { text: "With the application, the county requires either an accessibility letter from Public Works for sewer or water (which may need to come from the planning jurisdiction), or a septic permit or septic waiver from Environmental Health.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-16" },
      { text: "The county also requires zoning approval. Parcels under the county's zoning jurisdiction are handled in the county's office.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-16" },
      { text: "Lien agent and workers' compensation information are required if the job is over $40,000.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-16" },
      { text: "The county confirms the cost of a residential permit is based on square footage, heated and/or unheated, so unheated space counts toward the fee.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-16" },
      { text: "The county's zoning jurisdiction does not include Fairview, Indian Trail, Lake Park, Marshville, Marvin, Mineral Springs, Monroe, Stallings, Unionville, Waxhaw, Weddington, Wesley Chapel or Wingate. For zoning in those places, contact the town directly.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-16" },
      { text: "County residential page: re-inspections have no fee for a re-check. A $100 trip charge applies if a second failed re-inspection is requested and fails again.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-16" },
      { text: "The county publishes these residential forms: Owner Exemption Affidavit, Farm Structure-Use Affidavit, Plot Plan for Building Permit Application, 2018 NC Energy Code compliance resource, and a Temporary Power application.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-16" },
      { text: "The county's plot plan form covers one- and two-family dwellings, modular and mobile homes, and accessory structures. It must show streets, property lines with dimensions, existing and proposed buildings (including attached porches, decks, chimneys, carports and garages), distances to property lines and other structures, water bodies, streams and floodplain, and building heights for accessory structures. You can draw it on the form or attach a survey. A separate application and plot plan are needed for each building.", sourceUrl: "https://www.unioncountync.gov/home/showpublisheddocument/698/638555936100270000", checkedOn: "2026-11-16" },
      { text: "County fee schedule (effective Aug. 1, 2026): new construction and additions that are attached, heated or unheated, are charged the gross floor area under roof times $0.84 per sq ft, covering building, electrical, plumbing and mechanical permits. Detached, unheated projects are charged $0.24 per sq ft for building and electrical permits. Any heated project is charged at the higher rate. The schedule does not say whether an open deck counts as floor area.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-16" },
      { text: "County fee schedule: minimum fee $100. Residential renovations are area times $0.84 times 50%. Zoning permit $60. Re-inspection fee $100. Extra inspection fee $100 each. Starting work without a permit is charged double the permit fee. Fees are rounded to the nearest dollar.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-16" },
      { text: "County fee schedule: the county also collects a $10 Residential Homeowners Recovery Fund fee. A $25 residential State Building Code Regulatory Fund fee is added from January 1, 2027.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-16" },
      { text: "County fee schedule: a permit expires if work has not started within six months, or is stopped for 12 months. A second permit within six months of expiry costs $100. After that, full fees are charged again.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-16" },
      { text: "Inspections are typically completed the day requested. When requests exceed what can be done in a day, the rest carry forward. For an occupied home, put a phone number on the inspection request so the inspector can call before arriving.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-16" },
      { text: "The county's Zoning Administrator enforces the Union County Development Ordinance (use, setbacks from property lines, floodplain) for unincorporated Union County. The county page describes the Zoning Administrator's role in plan review for commercial buildings only; it does not say the same for residential.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-16" },
      { text: "Other county-published documents: Lien Agent form, Workers Comp form, Registered Design Professional Inspection form, 2018 Appendix B, and a residential Temporary Power application.", sourceUrl: "https://www.unioncountync.gov/government/departments-a-e/building-code-enforcement", checkedOn: "2026-11-16" },
    ],
  },
  robeson: {
    id: "robeson",
    name: "Robeson County, NC",
    coverage: "directory",
    officeLabel: "Robeson County Community Development (Planning, Zoning & Inspections)",
    officeUrl: "https://www.robesoncountync.gov/departments/community-development/",
    officePhone: "910-272-6540",
    officeAddress: "701 N. Elm Street, Lumberton, NC 28358",
    note: "Pembroke and other towns in Robeson County are not mentioned on the county page, so whether the town or the county handles its permits is not confirmed. Zoning office: 910-272-6521. No general department email is listed.",
    facts: [
      { text: "The county department issues building, electrical, plumbing, mechanical and other permits, and also issues zoning permits.", sourceUrl: "https://www.robesoncountync.gov/departments/community-development/", checkedOn: "2026-11-18" },
      { text: "Inspections: 910-272-6540. Zoning: 910-272-6521. Permits cannot be issued after 4:00 pm. The page also gives department hours of 8:15 am to 5:15 pm and, elsewhere, 8:30 am to 5:00 pm.", sourceUrl: "https://www.robesoncountync.gov/departments/community-development/", checkedOn: "2026-11-18" },
      { text: "Application forms (building and manufactured home, electrical, mechanical, plumbing, pool and spa, demolition, variance) and a permit fee schedule are linked on the county page.", sourceUrl: "https://www.robesoncountync.gov/departments/community-development/", checkedOn: "2026-11-18" },
      { text: "A county blog post says adding or replacing a deck, building a shed or accessory structure, and a room addition may need a permit depending on the project and location, and tells residents to confirm before starting. It gives no size thresholds, fees or review times.", sourceUrl: "https://www.robesoncountync.gov/single-post/how-to-apply-for-building-permits-for-home-renovations", checkedOn: "2026-11-20" },
      { text: "A county notice posted November 20, 2026 names James Locklear, Code Enforcement Officer, at 910-272-6521 for questions about local permits and inspections. It says local permitting stays with the county, and that from January 1, 2027 the county will collect a new state building code fee ($25 residential, $10 trade, alteration and repair).", sourceUrl: "https://www.robesoncountync.gov/single-post/changes-to-nc-building-code-administration", checkedOn: "2026-11-20" },
    ],
  },
  wake: {
    id: "wake",
    name: "Wake County, NC",
    coverage: "directory",
    officeLabel: "Wake County Permits and Inspections",
    officeUrl: "https://www.wake.gov/departments-government/permits-and-inspections",
    officePhone: "919-856-6222",
    officeEmail: "Wake.Permitting@wake.gov",
    officeAddress: "336 Fayetteville St., First Floor, Raleigh, NC 27602",
    note: "The county covers unincorporated Wake County, and by contract the towns of Knightdale, Rolesville, Wendell and Zebulon. Raleigh and other towns are not stated on the county page, so confirm with the town.",
    facts: [
      { text: "Office hours are 8:15 a.m. to 5 p.m., Monday to Friday. Field inspection hours are 7:15 a.m. to 4 p.m.", sourceUrl: "https://www.wake.gov/departments-government/permits-and-inspections", checkedOn: "2026-11-18" },
      { text: "The county provides permitting and inspections for all unincorporated areas of Wake County, and by contract for Knightdale, Rolesville, Wendell and Zebulon.", sourceUrl: "https://www.wake.gov/departments-government/permits-and-inspections", checkedOn: "2026-11-18" },
      { text: "Permits are applied for in the county's online Permit Portal.", sourceUrl: "https://www.wake.gov/departments-government/permits-and-inspections", checkedOn: "2026-11-18" },
      { text: "Wake County FAQ: accessory buildings are exempt from a permit where no dimension exceeds 12 feet. Nonstructural work under $40,000 in a single-family home is exempt unless it involves new or altered plumbing, mechanical or electrical systems. Replacing pickets, railings, stair treads and decking on porches and decks, and replacing windows, doors and siding, are exempt.", sourceUrl: "https://www.wake.gov/departments-government/permits-and-inspections/permits-and-inspections-faq", checkedOn: "2026-11-18" },
      { text: "Wake County FAQ: a person may act as their own general contractor for a home, addition or accessory structure if they own the property and will personally occupy it for 12 months after completion.", sourceUrl: "https://www.wake.gov/departments-government/permits-and-inspections/permits-and-inspections-faq", checkedOn: "2026-11-18" },
      { text: "Wake County fee schedule (effective date not stated): deck, addition, and attached or detached garage or shed are each $75 plus $0.25 per sq ft of gross floor area. Re-inspections: $100 first, $200 second, $300 third, $400 fourth or later.", sourceUrl: "https://wake.gov/departments-government/planning-development-inspections/inspections-permits/inspections-permits-fee-schedule", checkedOn: "2026-11-18" },
      { text: "Wake County deck or porch permit package: online application, a site plan, building plans, a workers' compensation certificate or exemption affidavit, and a notarized owner-contractor affidavit for projects of $40,000 or more where an owner is listed as general contractor. Plans follow the 2018 NC Residential Code Appendix M and may be hand drawn if neat. The minimum checklist lists dimensions and spans, tallest floor height above grade, footings at least 12 in. into soil, post, girder and joist sizes, 36 in. guardrails where the floor is more than 30 in. above grade, bracing for free-standing decks and for attached decks with a floor 4 ft or higher, deck-to-house attachment, and cantilevers. Engineer-stamped plans are required for two-story decks and decks supporting hot tubs or spas.", sourceUrl: "https://www.wake.gov/departments-government/permits-and-inspections/permit-guidance/build-deck-or-porch", checkedOn: "2026-11-20" },
      { text: "Wake County: a permit may also trigger a Watershed Management review if the lot has flood hazard areas or the proposed impervious area exceeds the limit. Each review is $50, invoiced through the Permit Portal. If the lot has septic, the new structure must keep required setbacks from the septic system, repair area and wells, and trenching must be shown on the site plan. A field consultation fee and site visit may apply.", sourceUrl: "https://www.wake.gov/departments-government/permits-and-inspections/permit-guidance/build-deck-or-porch", checkedOn: "2026-11-20" },
      { text: "Wake County additions: an addition that increases the footprint needs a full site plan with impervious surface calculations. An addition or alteration inside the existing footprint needs a site plan only if it adds bedrooms and the home is on septic. Plans must show the bedroom count matching the application and septic permit, energy code details, and rooms labeled by real use (not bonus, flex or office). The same workers' compensation and $40,000 owner-contractor affidavit rules apply.", sourceUrl: "https://www.wake.gov/departments-government/permits-and-inspections/permit-guidance/add-or-alter-my-home", checkedOn: "2026-11-20" },
      { text: "Wake County accessory buildings (shed or detached garage): any dimension over 12 ft needs a building permit. Buildings with no dimension over 12 ft may still need a Land Use Permit from Wake County Planning & Zoning. Plans follow the 2018 NC Residential Code. Structural elements not in the code need a sealed design by an NC engineer or architect or an accepted evaluation report.", sourceUrl: "https://www.wake.gov/departments-government/permits-and-inspections/permit-guidance/build-accessory-building", checkedOn: "2026-11-20" },
    ],
  },
  guilford: {
    id: "guilford",
    name: "Guilford County, NC",
    coverage: "directory",
    officeLabel: "Guilford County Inspections Department",
    officeUrl: "https://www.guilfordcountync.gov/our-county/inspections",
    officeAddress: "301 W. Market St., Greensboro, NC 27401",
    note: "The county covers unincorporated Guilford County and, by contract, several named towns and the Piedmont Triad Airport Authority. The county page does not mention Greensboro or High Point, so confirm with the city.",
    facts: [
      { text: "The department provides permitting, plan review and building inspection services for all unincorporated areas of Guilford County, and by contract for several named towns.", sourceUrl: "https://www.guilfordcountync.gov/our-county/inspections", checkedOn: "2026-11-18" },
      { text: "Permits are applied for in the county's Civic Access public portal.", sourceUrl: "https://www.guilfordcountync.gov/our-county/inspections", checkedOn: "2026-11-18" },
      { text: "The county's general hours are Monday to Friday, 8 a.m. to 5 p.m. A phone number and email for Inspections were not on the page read.", sourceUrl: "https://www.guilfordcountync.gov/our-county/inspections", checkedOn: "2026-11-18" },
      { text: "Guilford County permit guidance: an addition uses the Residential Building-Addition permit type in the Civic Access portal. Attached decks and porches use the addition type. Freestanding decks and accessory buildings use Residential Accessory-Accessory. An accessory building with any dimension over 12 feet must comply with the NC Residential Code.", sourceUrl: "https://www.guilfordcountync.gov/our-county/inspections/permits/demo-permits", checkedOn: "2026-11-18" },
      { text: "Guilford County: a plot plan drawn to scale (property lines, setbacks, water features) is required for most residential projects, and the county publishes a minimum plan review checklist. Sealed engineered plans must be on site at the first inspection. A lien agent is required for projects costing $40,000 or more. Applicants in towns need a Development Clearance Certificate from the town before applying.", sourceUrl: "https://www.guilfordcountync.gov/our-county/inspections/permits/demo-permits", checkedOn: "2026-11-18" },
      { text: "Guilford County: no fee amounts, review time or permit expiration are stated on the permit guidance page. A building permit timeframes dashboard is linked there.", sourceUrl: "https://www.guilfordcountync.gov/our-county/inspections/permits/demo-permits", checkedOn: "2026-11-18" },
      { text: "Guilford County permit guidance (re-read November 20, 2026): a deck or porch greater than 36 sq ft requires a separate building permit. Decks follow NC Residential Code Appendix M. Decks with post heights above the Appendix M Table AM108.1 limit, and decks supporting hot tubs or spas, must be designed by an NC registered design professional. The deck plan is drawn top-down, with elevations showing the tallest deck floor height, bracing for free-standing decks and decks attached to a floor 4 ft or higher, deck-to-house attachment, and guardrails where the floor is over 30 in. above grade.", sourceUrl: "https://www.guilfordcountync.gov/government/departments-and-agencies/inspections/permit-guidance", checkedOn: "2026-11-20" },
      { text: "Guilford County: a Development Clearance Certificate is required from the towns of Jamestown, Oak Ridge, Sedalia, Summerfield and Whitsett, and from the Piedmont Triad Airport Authority, before applying for any permit. Engineered structural elements and sealed plans must be on site at the first inspection. Permits changed after review or issuance carry an amendment fee, and inspections are held until the amendment is processed. A re-inspection fee is charged for each additional inspection.", sourceUrl: "https://www.guilfordcountync.gov/government/departments-and-agencies/inspections/permit-guidance", checkedOn: "2026-11-20" },
      { text: "Guilford County: a detached accessory building with any dimension over 12 ft must comply with the NC Residential Code. Prefab storage buildings and pre-engineered metal buildings are not covered by the prescriptive code, so they need a sealed design, usually supplied by the manufacturer. Gazebos, pavilions, carports and covered pergolas also need a sealed design.", sourceUrl: "https://www.guilfordcountync.gov/government/departments-and-agencies/inspections/permit-guidance", checkedOn: "2026-11-20" },
    ],
  },
  buncombe: {
    id: "buncombe",
    name: "Buncombe County, NC",
    coverage: "directory",
    officeLabel: "Buncombe County Permits & Inspections",
    officeUrl: "https://www.buncombecounty.org/Governing/Depts/Permits/Permitting.aspx",
    officePhone: "828-250-5360",
    officeAddress: "35 Woodfin Street, Asheville, NC 28801",
    note: "The county page does not say whether the City of Asheville or other municipalities are included, so confirm with the city.",
    facts: [
      { text: "Hours are Monday to Friday, 8:00 a.m. to 5:00 p.m. No permit applications or fees can be processed after 4:00 p.m.", sourceUrl: "https://www.buncombecounty.org/Governing/Depts/Permits/Permitting.aspx", checkedOn: "2026-11-18" },
      { text: "The division lists Decks and Residential Accessory Buildings among the permit services it provides in Buncombe County. Additions are not named on that page, but the county's application guide (below) lists a Single-Family/Duplex/Townhome Addition permit.", sourceUrl: "https://www.buncombecounty.org/Governing/Depts/Permits/Permitting.aspx", checkedOn: "2026-11-18" },
      { text: "Buncombe County application guide: for new construction, first get a site plan review (SPR) from the planning department, then apply. Permit types listed include Single-Family/Duplex/Townhome Addition, New Residential Deck, New Residential Sunroom, New Detached Garage (no heated space), New Carport and New Detached Accessory Building (no heated space). Applications can be brought to the office or emailed to permitdocs@buncombecounty.org. After paying the permit fee you must upload plans, plus proof of water and sewer or septic and well approval, a workers' compensation affidavit, and a lien agent appointment where required.", sourceUrl: "https://www.buncombenc.gov/DocumentCenter/View/1747/How-to-Apply-for-a-New-Residential-Building-Permit-PDF", checkedOn: "2026-11-20" },
      { text: "Buncombe County application guide: a lien agent is not required for improvements under $40,000 or for improvements to an existing single-family home used by the owner as a residence. Projects of $40,000 or more require a licensed NC general contractor. A homeowner may act as their own contractor if the home is not for sale, rent or lease, with the Owner Exemption Affidavit. A Residential Spec Sheet must be part of the plan submittal for a new deck, sunroom, detached garage or carport, and unheated detached accessory structure.", sourceUrl: "https://www.buncombenc.gov/DocumentCenter/View/1747/How-to-Apply-for-a-New-Residential-Building-Permit-PDF", checkedOn: "2026-11-20" },
    ],
  },
  durham: {
    id: "durham",
    name: "Durham County, NC",
    coverage: "directory",
    officeLabel: "City-County Building & Safety Department",
    officeUrl: "https://dconc.gov/county-departments/departments-a-e/city-county-inspections",
    officePhone: "919-560-4144",
    officeAddress: "101 City Hall Plaza, Durham, NC 27701",
    note: "This is a joint City and County of Durham department. The Small Project Review checklist covers decks, porches and additions. Detached garages and accessory buildings were not found on the pages read.",
    facts: [
      { text: "Hours are Monday to Friday, 8 a.m. to 5 p.m. The customer service lobby is open 9 a.m. to 3 p.m.", sourceUrl: "https://dconc.gov/county-departments/departments-a-e/city-county-inspections", checkedOn: "2026-11-18" },
      { text: "Building, electrical, plumbing and standard mechanical inspections are scheduled through the Land Development Office (LDO) portal.", sourceUrl: "https://dconc.gov/county-departments/departments-a-e/city-county-inspections", checkedOn: "2026-11-18" },
      { text: "Durham uses one Small Project Review checklist (version dated June 4, 2024) for decks, porches and additions to an existing primary structure. Required package: signed application, the completed checklist, a smoke and carbon monoxide alarm form if any enclosed space is proposed, a scaled and dimensioned plot plan including any deck (a surveyor-sealed plot plan may be required), and full construction drawings. The job description, scope of work and plans must not conflict with each other. Omissions may cause the whole package to be rejected and require a complete re-submission.", sourceUrl: "https://www.durhamnc.gov/DocumentCenter/View/29365/2--Addition-Porches-andor-Decks-Checklist-06-04-24-fillable-", checkedOn: "2026-11-20" },
      { text: "Durham Small Project Review: for projects of $40,000 or more, submit a lien agent form or notarized Owner Lien Agent Requirement Release, a workers' compensation affidavit or certificate of liability insurance, and show a licensed general contractor or a notarized Owner Exemption Affidavit. Applications without a required lien agent will not be approved. Review fees are paid online after the application is entered in the LDO system and before review starts. Reviews are done in the order received, there may be a re-review fee for omissions, and accepting a package is not an approval.", sourceUrl: "https://www.durhamnc.gov/DocumentCenter/View/29365/2--Addition-Porches-andor-Decks-Checklist-06-04-24-fillable-", checkedOn: "2026-11-20" },
      { text: "Durham Small Project Review: the plot plan must show setbacks from property lines under the Unified Development Ordinance, mechanical equipment, streams, no-build buffers and easements, and impervious area if the lot is in a watershed overlay, with flood plain data where relevant. Zoning, historic preservation, floodplain and airport overlay questions go to the City-County Planning & Development Department (planning@durhamnc.gov). No review time is stated on the pages read.", sourceUrl: "https://www.durhamnc.gov/DocumentCenter/View/29365/2--Addition-Porches-andor-Decks-Checklist-06-04-24-fillable-", checkedOn: "2026-11-20" },
    ],
  },
  johnston: {
    id: "johnston",
    name: "Johnston County, NC",
    coverage: "directory",
    officeLabel: "Johnston County Inspections (Land Use Center)",
    officeUrl: "https://www.johnstonnc.gov/insp/content.cfm?pageid=82",
    officePhone: "919-989-5060",
    officeEmail: "inspections@johnstonnc.gov",
    officeAddress: "309 E. Market Street, Smithfield, NC 27577",
    note: "Which towns the county covers is not stated on the page read. Zoning fees and building fees are listed separately.",
    facts: [
      { text: "Hours are Monday to Friday, 8:00 a.m. to 5:00 p.m.", sourceUrl: "https://www.johnstonnc.gov/insp/content.cfm?pageid=82", checkedOn: "2026-11-18" },
      { text: "Residential accessory buildings: land use or zoning permit fee $25. Deck or gazebo $75, storage building $100, garage or carport $100, plus $75 per trade inspection if electrical, plumbing or mechanical permits are needed.", sourceUrl: "https://www.johnstonnc.gov/insp/content.cfm?pageid=82", checkedOn: "2026-11-18" },
      { text: "Residential additions and remodels: land use or zoning permit fee $25. $200 for 0 to 400 sq ft, then $0.30 per sq ft over 400, plus $75 per trade inspection.", sourceUrl: "https://www.johnstonnc.gov/insp/content.cfm?pageid=82", checkedOn: "2026-11-18" },
      { text: "Johnston County planning page: permits are required for additions and remodels, all decks and porches (no size threshold), and detached accessory structures over 12 feet in any dimension or more than one story. Cosmetic work, replacing doors and windows without structural changes, and fences are exempt. Building Inspections 919-989-5060. Planning (Land Use Center) 919-989-5150, planning@johnstonnc.gov.", sourceUrl: "https://johnstonnc.gov/planning/content.cfm?pageid=58", checkedOn: "2026-11-18" },
      { text: "Johnston County additions page (last updated September 1, 2026): a permit is not required for non-structural work under $40,000 on a single-family home, such as replacing windows, doors, siding, or the pickets, railings, stair treads and decking of porches and decks. Additions, enclosing carports or garages, sunrooms and finishing an attic need one. Turn in a zoning/land use permit, an Environmental Health permit (septic and well location, 919-989-5180), a site plan, and structural plans. Structural plans must be digital only and meet the current NC Residential Code. The county's Residential Site Plan requirements apply to lots in the county; lots in a town go through that town.", sourceUrl: "https://www.johnstonnc.gov/insp/content.cfm?pageid=137", checkedOn: "2026-11-20" },
      { text: "Johnston County additions page: enclosing an existing carport or garage needs verification of the footing and foundation before work starts and insulation meeting current energy requirements. Closing in a deck as a sunroom needs either a new footing or a Professional Engineer's structural report on the existing deck. Finishing an attic needs proof the floor system carries the load. A homeowner may do the work if they live there and stay for one year after, with the Owner License Exemption Form. Jobs under $40,000 may be done by an unlicensed contractor. Electrical, plumbing and mechanical work must be done by a licensed person unless the resident owner does it.", sourceUrl: "https://www.johnstonnc.gov/insp/content.cfm?pageid=137", checkedOn: "2026-11-20" },
    ],
  },
  pitt: {
    id: "pitt",
    name: "Pitt County, NC",
    coverage: "directory",
    officeLabel: "Pitt County Permitting & Inspections",
    officeUrl: "https://www.pittcountync.gov/371/Permitting-Center",
    officePhone: "252-902-3150",
    officeAddress: "1717 W 5th Street, Greenville, NC 27834",
    note: "Pitt County issues permits in unincorporated areas only. Greenville, Farmville and Winterville issue their own building permits, and other towns issue permits within their limits or ETJ.",
    facts: [
      { text: "Hours are Monday to Friday, 8:00 a.m. to 5:00 p.m. Zoning approval is required for all building permits.", sourceUrl: "https://www.pittcountync.gov/371/Permitting-Center", checkedOn: "2026-11-18" },
      { text: "Additions or changes to existing buildings need a building permit. Decks and accessory structures are not named on the page read.", sourceUrl: "https://www.pittcountync.gov/371/Permitting-Center", checkedOn: "2026-11-18" },
      { text: "Permits are applied for in the county's online Permit Portal.", sourceUrl: "https://www.pittcountync.gov/371/Permitting-Center", checkedOn: "2026-11-18" },
      { text: "Pitt County steps as listed: Environmental Health approval first if the lot has septic; then an application package of two sets of plans, a completed application, and lien agent documentation for projects over $30,000. Inside a municipality or its ETJ, a municipal zoning compliance permit is also needed. Plans are reviewed for zoning, building code and floodplain compliance. The county page says the lien agent threshold is $30,000, but state law uses $40,000, so confirm.", sourceUrl: "https://www.pittcountync.gov/1418/New-Construction-Permits-Inspections", checkedOn: "2026-11-18" },
      { text: "Pitt County: if the owner does the work, an owner affidavit is required. Work that begins without a permit may be charged double permit fees. Residential fees are in the county's Manual of Fees for Residential Permits; amounts were not on the page read.", sourceUrl: "https://www.pittcountync.gov/1418/New-Construction-Permits-Inspections", checkedOn: "2026-11-18" },
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
    statedTime: "County says residential can take anywhere from 2 to 5 weeks, depending on what the project is and how each department and zoning jurisdiction reviews it",
    sourceLabel: "Cabarrus County written reply, Nov 2026; Construction Standards online access",
    sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access",
    status: "verified",
    note: "The county confirmed in writing that a stand-alone deck needs a building permit and inspections. It is applied for in Accela as a standard building permit.",
  },

  {
    id: "C6",
    jurisdiction: "cabarrus",
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["addition"],
    where: "county",
    title: "County building permit, applied for in Accela",
    statedTime: "County says residential can take anywhere from 2 to 5 weeks, depending on what the project is and how each department and zoning jurisdiction reviews it",
    sourceLabel: "Cabarrus County written reply, Nov 2026; Construction Standards online access",
    sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access",
    status: "verified",
    note: "The county confirmed in writing that a residential addition is a standard building permit in Accela and does not go through plan review.",
  },

  {
    id: "C7",
    jurisdiction: "cabarrus",
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["garage"],
    where: "county",
    title: "County building permit, applied for in Accela",
    statedTime: "County says residential can take anywhere from 2 to 5 weeks, depending on what the project is and how each department and zoning jurisdiction reviews it",
    sourceLabel: "Cabarrus County written reply, Nov 2026; Construction Standards online access; Zoning FAQ",
    sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access",
    status: "verified",
    note: "The county confirmed in writing that a detached garage is a standard building permit in Accela and does not go through plan review. The zoning FAQ says a building permit may depend on the size of a structure, and the county did not give a size line for small accessory buildings.",
  },

  {
    id: "C8",
    jurisdiction: "cabarrus",
    checkedOn: "2026-11-16",
    kind: "step",
    projects: ["deck","addition","garage"],
    where: "county",
    title: "No county plan review for a deck, addition or detached garage",
    statedTime: "County says residential can take anywhere from 2 to 5 weeks, depending on what the project is and how each department and zoning jurisdiction reviews it",
    sourceLabel: "Cabarrus County written reply, Nov 2026; Plan Review page",
    sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Plan-Review",
    status: "verified",
    note: "The county confirmed in writing that plan review is not needed for a deck, a residential addition or a detached garage. Plan review applies to new primary residences and commercial projects. The residential time conflict (5-7 versus 2-5 business days) applies only to that path. If your project does go through the Digital Plan Room: PDFs only (100 MB maximum, no encrypted files), building and site reviews submitted separately, and no new uploads in the middle of a review cycle.",
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
    title: "Plan review for a deck, addition or garage: not needed",
    statedTime: "County says residential can take anywhere from 2 to 5 weeks, depending on what the project is and how each department and zoning jurisdiction reviews it",
    sourceLabel: "Cabarrus County written reply, Nov 2026",
    sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access",
    status: "verified",
    note: "Answered by the county in writing: plan review is not needed for a deck, addition or detached garage.",
  },

  {
    id: "C14",
    jurisdiction: "cabarrus",
    checkedOn: "2026-11-16",
    kind: "question",
    projects: ["deck", "addition", "garage"],
    where: "county",
    title: "Order of steps: zoning permit first, building permit second",
    statedTime: "Not a review step",
    sourceLabel: "Cabarrus County written reply, Nov 2026",
    sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access",
    status: "verified",
    note: "Answered by the county in writing: zoning approval first, building permit second. Where septic or a well applies, the Health Alliance approval comes before the zoning permit. For a property inside a town, the town handles zoning, so confirm with the town.",
  },

  {
    id: "C15",
    jurisdiction: "cabarrus",
    checkedOn: "2026-11-16",
    kind: "question",
    projects: ["deck", "addition", "garage"],
    where: "county",
    title: "Building permit fees depend on square footage",
    statedTime: "Not applicable",
    sourceLabel: "Cabarrus County written reply, Nov 2026",
    sourceUrl: "https://www.cabarruscounty.us/Government/Departments/Construction-Standards/Online-Access",
    status: "partly",
    note: "The county said building permit fees for a deck, addition and detached garage depend on square footage. No rate was given. The county's zoning fees are published separately.",
  },
  {
    id: "T1",
    jurisdiction: "catawba",
    checkedOn: "2026-11-18",
    kind: "step",
    projects: ["deck"],
    where: "outside",
    title: "County zoning permit or waiver letter",
    statedTime: "Not stated",
    sourceLabel: "Catawba County Permit Center, permit information; Fee schedule FY27",
    sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/",
    status: "partly",
    note: "The county says most building projects need zoning approval and that an approved zoning permit or a waiver letter from the zoning department comes before a building permit. A stand-alone deck is not named on the county's zoning pages, so confirm whether a deck needs a zoning permit or a waiver letter. The county's zoning fee for residential additions and accessory structures is $25.",
  },

  {
    id: "T2",
    jurisdiction: "catawba",
    checkedOn: "2026-11-18",
    kind: "step",
    projects: ["addition"],
    where: "outside",
    title: "County zoning permit",
    statedTime: "Not stated",
    sourceLabel: "Catawba County Permit Center, residential handout; Fee schedule FY27",
    sourceUrl: "https://www.catawbacountync.gov/site/assets/files/5316/procedu_for_res_dwell.pdf",
    status: "partly",
    note: "The county's residential handout (undated) says all residential addition permits also require zoning approval, and that comes before the building permit. The zoning fee for residential additions is $25 in the FY27 fee schedule.",
  },

  {
    id: "T3",
    jurisdiction: "catawba",
    checkedOn: "2026-11-18",
    kind: "step",
    projects: ["garage"],
    where: "outside",
    title: "County zoning permit",
    statedTime: "Not stated",
    sourceLabel: "Catawba County, accessory building requirements; Fee schedule FY27",
    sourceUrl: "https://www.catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/for-unlicensed-general-contractors/",
    status: "verified",
    note: "The county lists zoning permit approval as the first item for an accessory building, and says to contact the jurisdiction where the project is located. The zoning fee for residential accessory structures is $25. A plot plan (scaled drawing of existing and proposed buildings) is required for residential zoning, according to the county's procedures manual (updated 2013).",
  },

  {
    id: "T4",
    jurisdiction: "catawba",
    checkedOn: "2026-11-18",
    kind: "step",
    projects: ["deck", "addition", "garage"],
    where: "city",
    title: "Zoning approval from your city or town planning office",
    statedTime: "Not stated",
    sourceLabel: "Catawba County Permit Center, planning department contacts",
    sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/",
    status: "verified",
    note: "The county tells applicants to contact the planning department for the jurisdiction where the project is located. The county's list: Claremont 828-466-7260, Conover 828-464-1191, Hickory 828-323-7410, Newton 828-695-4326, Brookford 828-322-4903, Catawba 828-466-7260, Long View 828-322-6165, Maiden 828-428-5034. Unincorporated areas use the county.",
  },

  {
    id: "T5",
    jurisdiction: "catawba",
    checkedOn: "2026-11-18",
    kind: "step",
    projects: ["deck", "addition", "garage"],
    where: "county",
    title: "Septic, well or sewer approval",
    statedTime: "Not stated",
    sourceLabel: "Catawba County, requirements by project type; residential handout",
    sourceUrl: "https://www.catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/for-unlicensed-general-contractors/",
    status: "partly",
    note: "The county lists water and sewer approval, or septic and well approval from Environmental Health (828-465-8270), as a requirement for accessory buildings and alterations. Approval is also required if a bedroom is added. A stand-alone deck is not named, so confirm whether it applies.",
  },

  {
    id: "T6",
    jurisdiction: "catawba",
    checkedOn: "2026-11-18",
    kind: "step",
    projects: ["garage"],
    where: "county",
    title: "Erosion control affidavit",
    statedTime: "Not stated",
    sourceLabel: "Catawba County, accessory building requirements",
    sourceUrl: "https://www.catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/for-unlicensed-general-contractors/",
    status: "verified",
    note: "The county lists an Erosion Control Affidavit among the items for an accessory building.",
  },

  {
    id: "T7",
    jurisdiction: "catawba",
    checkedOn: "2026-11-18",
    kind: "step",
    projects: ["deck"],
    where: "county",
    title: "County building permit, applied for in ePermits",
    statedTime: "Not stated",
    sourceLabel: "Catawba County written reply, Nov 2026; Fee schedule FY27",
    sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/",
    status: "verified",
    note: "The county confirmed in writing that a deck always needs a building permit, because it attaches to an existing structure and adds footprint. It is applied for in ePermits. The FY27 fee is $0.25 per sq ft with a $90 minimum.",
  },

  {
    id: "T8",
    jurisdiction: "catawba",
    checkedOn: "2026-11-18",
    kind: "step",
    projects: ["addition"],
    where: "county",
    title: "County building permit, applied for in ePermits",
    statedTime: "Not stated",
    sourceLabel: "Catawba County written reply, Nov 2026",
    sourceUrl: "https://www.catawbacountync.gov/site/assets/files/5316/procedu_for_res_dwell.pdf",
    status: "verified",
    note: "Additions onto a home are charged $0.50 per sq ft. If alterations are also done inside the existing structure, the county also charges for the cost of that work. A standard building permit is applied for in ePermits.",
  },

  {
    id: "T9",
    jurisdiction: "catawba",
    checkedOn: "2026-11-18",
    kind: "step",
    projects: ["garage"],
    where: "county",
    title: "County building permit, applied for in ePermits",
    statedTime: "Not stated",
    sourceLabel: "Catawba County written reply, Nov 2026; Fee schedule FY27",
    sourceUrl: "https://www.catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/for-unlicensed-general-contractors/",
    status: "verified",
    note: "A detached accessory building needs a building permit if it is larger than 12 by 12 feet on any side. At 12 by 12 or smaller no building permit is needed, but a zoning permit and Environmental Health approval (if there is a septic system or well) still are. The FY27 fee is $0.25 per sq ft with a $90 minimum.",
  },

  {
    id: "T10",
    jurisdiction: "catawba",
    checkedOn: "2026-11-18",
    kind: "step",
    projects: ["deck", "addition", "garage"],
    where: "county",
    title: "Plan review is not needed for most decks, additions and garages",
    statedTime: "A few hours to 10 days, when plan review applies",
    sourceLabel: "Catawba County written reply, Nov 2026",
    sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/plan-review/",
    status: "verified",
    note: "The county confirmed in writing that plan review for residential property is only required when the structure is metal framed or uses metal trusses, is post and beam construction, or is changing from residential to commercial use. Sealed engineered drawings are required for plan review. Otherwise a deck, addition or garage is a standard building permit applied for in ePermits.",
  },

  {
    id: "T11",
    jurisdiction: "catawba",
    checkedOn: "2026-11-18",
    kind: "step",
    projects: ["deck", "garage"],
    where: "county",
    title: "Building permit fees: $0.25 per sq ft",
    statedTime: "Not stated",
    sourceLabel: "Catawba County FY27 Fee Schedule (effective July 1, 2026)",
    sourceUrl: "https://catawbacountync.gov/site/assets/files/11750/fy27_fee_schedule.pdf",
    status: "verified",
    note: "Residential accessory (garage) and a stand-alone residential deck are each $0.25 per sq ft, with a $90 minimum building permit fee. Electrical, plumbing and mechanical permits are separate (for example, new electrical service $75, mechanical system $75, minimum $60 each). Work started without a permit is charged double.",
  },

  {
    id: "T12",
    jurisdiction: "catawba",
    checkedOn: "2026-11-18",
    kind: "step",
    projects: ["addition"],
    where: "county",
    title: "Building permit fee for an addition: $0.50 per sq ft",
    statedTime: "Not stated",
    sourceLabel: "Catawba County written reply, Nov 2026",
    sourceUrl: "https://catawbacountync.gov/site/assets/files/11750/fy27_fee_schedule.pdf",
    status: "verified",
    note: "The county confirmed in writing that additions onto homes are $0.50 per sq ft. Alterations inside the existing structure are also charged by the cost of the work (the schedule's alteration table starts at $90). Minimum building fee $90. Zoning $25.",
  },

  {
    id: "T13",
    jurisdiction: "catawba",
    checkedOn: "2026-11-18",
    kind: "step",
    projects: ["deck", "addition", "garage"],
    where: "county",
    title: "Owner or contractor forms",
    statedTime: "Not stated",
    sourceLabel: "Catawba County written reply, Nov 2026; county forms pages",
    sourceUrl: "https://www.catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/permit-information/for-owner-acting-as-the-general-contractor/",
    status: "partly",
    note: "A licensed contractor must be listed on the application. An owner acting as contractor must own the property in their own name, cannot rent, lease or sell it for one year after the project, and files the owner form. The county confirmed in writing that its license and cost threshold is $40,000. A lien agent designation is listed on the county page only for manufactured, modular and single family dwellings, not for accessory buildings or alterations.",
  },

  {
    id: "T14",
    jurisdiction: "catawba",
    checkedOn: "2026-11-18",
    kind: "step",
    projects: ["deck", "addition", "garage"],
    where: "county",
    title: "Inspections are scheduled for the following workday",
    statedTime: "Next workday, or the next available day if full",
    sourceLabel: "Catawba County Permit Services",
    sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/",
    status: "verified",
    note: "Request inspections online in ePermits or by phone at 828-465-8399, leaving the permit number or address, inspection type and desired date. A re-trip fee of $120 applies to any inspection.",
  },

  {
    id: "T15",
    jurisdiction: "catawba",
    checkedOn: "2026-11-18",
    kind: "question",
    projects: ["deck", "addition", "garage"],
    where: "county",
    title: "Plan review: only for metal framing, post and beam, or a change to commercial use",
    statedTime: "A few hours to 10 days",
    sourceLabel: "Catawba County written reply, Nov 2026",
    sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/plan-review/",
    status: "verified",
    note: "Answered by the county in writing. Plan review is only required for metal framed or metal truss structures, post and beam construction, or a change from residential to commercial use, and it needs sealed engineered drawings.",
  },

  {
    id: "T16",
    jurisdiction: "catawba",
    checkedOn: "2026-11-18",
    kind: "question",
    projects: ["deck", "addition", "garage"],
    where: "county",
    title: "Permit validity: 6 months without an inspection, then one year from the latest inspection",
    statedTime: "Valid 6 months without inspections",
    sourceLabel: "Catawba County written reply, Nov 2026",
    sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/",
    status: "verified",
    note: "Answered by the county in writing. A residential building permit is valid for 6 months without inspections. Once an inspection has happened (passed or failed), the expiration is extended to one year from the date of the most recent inspection. The county did not give a time for a standard building permit to be issued.",
  },

  {
    id: "T17",
    jurisdiction: "catawba",
    checkedOn: "2026-11-18",
    kind: "step",
    projects: ["deck", "addition", "garage"],
    where: "city",
    title: "Building permits are always issued by the county; towns issue zoning permits",
    statedTime: "Not stated",
    sourceLabel: "Catawba County written reply, Nov 2026; Building Services page",
    sourceUrl: "https://catawbacountync.gov/county-services/utilities-and-engineering/building-services/permit-services/",
    status: "verified",
    note: "Answered by the county in writing. Building permits are always issued by the county, and municipalities issue zoning permits for residential properties. The county's Building Services Division does inspections in the unincorporated areas and in Brookford, Catawba, Claremont, Conover, Hickory, Long View, Newton and Maiden.",
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
  {
    id: "S6",
    checkedOn: "2026-11-20",
    title: "New state fee on building permits starting January 1, 2027",
    summary:
      "The 2026 Appropriations Act (S.L. 2026-41, Sec. 13.3) creates a Building Codes and Interpretation Bureau in the NC Department of Labor on January 1, 2027. Each building permit applicant must then pay a State Building Code regulatory fee on top of local permit fees. Local governments collect it and send it to the state every quarter. Robeson County's notice lists the amounts as $25 for residential construction and $10 for other work such as trade, alteration and repair permits.",
    sourceLabel: "NC General Assembly bill summary, S.L. 2026-41 Sec. 13.3; Robeson County notice",
    sourceUrl: "https://dashboard.ncleg.gov/api/Services/BillSummary/2025/S257-SMCO-126(sl)-v-3",
    status: "partly",
    note: "The fee and its start date are in the legislature's own summary. The dollar amounts are from one county's notice, not from the statute text, so confirm them with the Department of Labor (1-800-625-2267) or your county. The notice says the building code itself does not change on that date.",
  },
];
