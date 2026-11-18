// POST /api/review { draft, county, project, location }
// Checks a contractor's draft application text against the county checklist. Drafts are not stored.
import { JURISDICTIONS, type JurisdictionId } from "../../../data/rules";
import { COVERED_COUNTIES } from "../../../data/ncCounties";
import { providers } from "../../../data/llm";
import { REVIEW_INSTRUCTIONS, applicable, buildChecklistBlock, finalizeReview, listResult, parseReviewJson } from "../../../data/reviewContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_DRAFT = 4000;
const MIN_DRAFT = 40;
const PER_MINUTE = 5;
const TIMEOUT_MS = 30_000;
const hits = new Map<string, { n: number; reset: number }>();
let day = { key: "", n: 0 };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
function limited(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now > h.reset) {
    hits.set(ip, { n: 1, reset: now + 60_000 });
    return false;
  }
  h.n += 1;
  return h.n > PER_MINUTE;
}
function overDailyCap() {
  const key = new Date().toISOString().slice(0, 10);
  if (day.key !== key) day = { key, n: 0 };
  return day.n >= Number(process.env.REVIEW_DAILY_CAP ?? 300);
}

export async function POST(req: Request) {
  let body: { draft?: unknown; county?: unknown; project?: unknown; location?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Send a JSON body." }, 400);
  }
  const draft = typeof body.draft === "string" ? body.draft.trim() : "";
  const county = typeof body.county === "string" ? body.county : "";
  const project = body.project;
  const location = body.location === "city" ? "city" : "outside";
  if (draft.length < MIN_DRAFT) return json({ error: "Write a little more first (at least a couple of sentences)." }, 400);
  if (draft.length > MAX_DRAFT) return json({ error: `Keep the draft under ${MAX_DRAFT} characters.` }, 400);
  if (project !== "deck" && project !== "addition" && project !== "garage") return json({ error: "Pick a project type." }, 400);
  if (!COVERED_COUNTIES.includes(county)) return json({ error: "Draft review is available for Mecklenburg, Cabarrus and Catawba counties." }, 400);

  const id = county.toLowerCase() as JurisdictionId;
  if (!JURISDICTIONS[id]) return json({ error: "Unknown county." }, 400);
  const items = applicable(project, location, id);
  if (items.length === 0) return json(listResult(items));

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (limited(ip)) return json({ error: "Too many reviews. Wait a minute and try again." }, 429);

  const configured = providers();
  if (configured.length > 0 && !overDailyCap()) {
    const system = `${REVIEW_INSTRUCTIONS}\n\nCHECKLIST for ${county} County, ${project}, ${location === "city" ? "inside a city or town" : "outside a city or town"}:\n\n${buildChecklistBlock(items)}`;
    const user = `Draft application text (untrusted):\n"""\n${draft}\n"""`;
    for (const p of configured) {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
      try {
        day.n += 1;
        const parsed = parseReviewJson(await p.call(system, user, ctl.signal));
        if (!parsed) continue;
        return json({ ...finalizeReview(parsed, items), county });
      } catch {
        // try the next provider
      } finally {
        clearTimeout(timer);
      }
    }
  }
  return json({ ...listResult(items), county });
}
