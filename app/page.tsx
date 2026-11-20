"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import "./globals.css";
import {
  JURISDICTIONS,
  PROJECT_LABELS,
  RULES,
  STATUS_LABELS,
  rulesFor,
  type JurisdictionId,
  type Location,
  type ProjectType,
} from "../data/rules";
import { CHECKLIST, itemsFor } from "../data/checklist";
import { DIRECTORY_COUNTIES } from "../data/ncCounties";
import { FEEDBACK_URL } from "../data/site";

const COUNTIES: { id: JurisdictionId; label: string }[] = [
  { id: "mecklenburg", label: "Mecklenburg" },
  { id: "cabarrus", label: "Cabarrus" },
  { id: "catawba", label: "Catawba" },
];
const PROJECTS: ProjectType[] = ["deck", "addition", "garage"];

// Example only: the item titles are real checklist items, the results are illustrative.
const EXAMPLE_STATES = ["covered", "covered", "missing", "unclear", "missing", "covered"] as const;
const EXAMPLE_LABEL = { covered: "Covered", missing: "Missing", unclear: "Unclear" } as const;

function RouteDemo() {
  const [county, setCounty] = useState<JurisdictionId>("mecklenburg");
  const [project, setProject] = useState<ProjectType>("deck");
  const [location, setLocation] = useState<Location>("city");
  const j = JURISDICTIONS[county];
  const labels = j?.locationLabels ?? { city: "Inside the city or town", outside: "Elsewhere in the county" };
  const agency = j?.agencyLabels ?? { city: "City or town", county: "County" };
  const steps = useMemo(() => rulesFor(project, location, county), [project, location, county]);
  const shown = steps.slice(0, 5);
  const more = steps.length - shown.length;
  const key = `${county}-${project}-${location}`;

  return (
    <div className="v2-route" aria-labelledby="route-title">
      <div className="v2-route-bar">
        <h2 id="route-title" className="v2-route-title">Your permit route</h2>
        <div className="v2-seg" role="group" aria-label="County">
          {COUNTIES.map((c) => (
            <button key={c.id} type="button" aria-pressed={county === c.id} onClick={() => setCounty(c.id)}>{c.label}</button>
          ))}
        </div>
        <div className="v2-seg" role="group" aria-label="Project">
          {PROJECTS.map((p) => (
            <button key={p} type="button" aria-pressed={project === p} onClick={() => setProject(p)}>{PROJECT_LABELS[p]}</button>
          ))}
        </div>
        <div className="v2-seg" role="group" aria-label="Location">
          {(["city", "outside"] as Location[]).map((l) => (
            <button key={l} type="button" aria-pressed={location === l} onClick={() => setLocation(l)}>{labels[l]}</button>
          ))}
        </div>
      </div>

      <ol className="v2-steps" key={key}>
        {shown.map((r, i) => (
          <li key={r.id} className={r.status === "verified" ? "ok" : "open"} style={{ ["--i" as string]: i }}>
            <div className="v2-step-head">
              <strong>{r.title}</strong>
              <span className="v2-chip" data-s={r.status}>{STATUS_LABELS[r.status]}</span>
            </div>
            <p className="v2-step-meta">
              {r.where === "city" ? agency.city : agency.county}. Stated time: {r.statedTime}
            </p>
            <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="v2-src">{r.sourceLabel}</a>
          </li>
        ))}
      </ol>

      <div className="v2-route-foot">
        {j?.statedDays && <p><b>What the agencies say:</b> {j.statedDays.label}</p>}
        <Link href="/planner" className="v2-btn v2-btn-ink">
          {more > 0 ? `See all ${steps.length} steps in the planner` : "Open the planner"}
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const verified = RULES.filter((r) => r.status === "verified").length;
  const sampleRules = useMemo(() => {
    const m = RULES.filter((r) => r.jurisdiction === "mecklenburg" && r.kind === "step");
    const pick = [m.find((r) => r.status === "verified"), m.find((r) => r.status === "partly"), RULES.find((r) => r.jurisdiction === "mecklenburg" && r.status === "unverified")];
    return pick.filter((r): r is NonNullable<typeof r> => !!r);
  }, []);
  const exampleItems = useMemo(() => itemsFor("deck", "city", "mecklenburg").slice(0, 6), []);

  return (
    <main className="home-page v2">
      <header className="v2-head">
        <div className="v2-wrap v2-head-in">
          <Link href="/" className="v2-brand" aria-label="Permivo home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/permivo-logo-a.svg" alt="" width={28} height={28} />
            <span>permivo</span>
          </Link>
          <nav aria-label="Main" className="v2-nav">
            <Link href="/planner">Planner</Link>
            <Link href="/checklist">Checklist</Link>
            <Link href="/review">Review</Link>
            <Link href="/ask">Ask</Link>
            <Link href="/tracker">Tracker</Link>
          </nav>
          <Link href="/planner" className="v2-btn v2-btn-or v2-head-cta">Try it free</Link>
        </div>
      </header>

      <section className="v2-wrap v2-hero" aria-labelledby="hero-title">
        <div className="v2-hero-copy">
          <h1 id="hero-title">Know your permit route before you quote the job.</h1>
          <p className="v2-lede">
            Permivo shows which reviews apply to your deck, addition or garage, how long the agencies say each one takes, and what to submit so the
            application does not come back. Every rule links to its source.
          </p>
          <div className="v2-actions">
            <Link href="/planner" className="v2-btn v2-btn-or">Plan a project</Link>
            <Link href="/review" className="v2-btn v2-btn-line">Check my application draft</Link>
          </div>
          <p className="v2-fine">Free while we build. Live for Mecklenburg, Cabarrus and Catawba counties, NC.</p>
        </div>
        <RouteDemo />
      </section>

      <section className="v2-wrap v2-problems" aria-labelledby="prob-title">
        <h2 id="prob-title">Permits cost contractors time before they cost fees.</h2>
        <div className="v2-prob-list">
          <article>
            <h3>The application comes back with comments.</h3>
            <div>
              <p>A missing plan detail turns into a correction round, and the job waits. Paste your application description and Permivo checks it against the county&apos;s own checklist before you submit.</p>
              <Link href="/review" className="v2-link">Review a draft</Link>
            </div>
          </article>
          <article>
            <h3>You quote a start date you can&apos;t back up.</h3>
            <div>
              <p>Agencies publish different times for different steps. Permivo lays out each step with the time the agency states, so your quote starts from the source and not from a guess.</p>
              <Link href="/planner" className="v2-link">Open the planner</Link>
            </div>
          </article>
          <article>
            <h3>Two agencies, and nobody tells you where it stands.</h3>
            <div>
              <p>Log each comment, hold and resubmission. Permivo compares your real timeline with what the county states, and prints a dated record you can show a client.</p>
              <Link href="/tracker" className="v2-link">Open the tracker</Link>
            </div>
          </article>
        </div>
      </section>

      <section className="v2-dark" aria-labelledby="rev-title">
        <div className="v2-wrap v2-rev">
          <div>
            <h2 id="rev-title">Find the gaps before the county does.</h2>
            <p className="v2-lede-d">
              Write the application the way you would normally describe the job. Permivo marks each checklist item as covered, missing or unclear, suggests edits,
              and gives you a cleaner version with blanks where information is missing. It never invents measurements.
            </p>
            <Link href="/review" className="v2-btn v2-btn-or">Review my draft</Link>
          </div>
          <div className="v2-sheet" aria-label="Example review result">
            <p className="v2-sheet-tag">Example. Mecklenburg County, deck.</p>
            <blockquote>
              Build a 12 by 16 ground-level deck on the rear of a single-family home. Pressure-treated framing, 6x6 posts on poured concrete footings, ledger
              bolted to the house band board. Owner is acting as the contractor.
            </blockquote>
            <ul>
              {exampleItems.map((it, i) => {
                const s = EXAMPLE_STATES[i] ?? "covered";
                return (
                  <li key={it.id}>
                    <span>{it.title}</span>
                    <span className="v2-state" data-s={s}>{EXAMPLE_LABEL[s]}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <section className="v2-wrap v2-trust" aria-labelledby="trust-title">
        <div className="v2-trust-copy">
          <h2 id="trust-title">If we haven&apos;t confirmed it, we say so.</h2>
          <p>
            {verified} of {RULES.length} rules are confirmed by an official county page or a written reply from county staff, and {CHECKLIST.length} checklist items
            are tied to a named source. Anything else is marked partly verified or not confirmed, with who to call. Third-party websites and chatbots are never
            treated as proof.
          </p>
          <p className="v2-fine">An early product. Not legal advice. The county&apos;s answer always decides.</p>
        </div>
        <div className="v2-recs">
          {sampleRules.map((r) => (
            <article key={r.id} className="v2-rec">
              <div className="v2-step-head">
                <strong>{r.title}</strong>
                <span className="v2-chip" data-s={r.status}>{STATUS_LABELS[r.status]}</span>
              </div>
              <p className="v2-step-meta">Stated time: {r.statedTime}</p>
              <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="v2-src">{r.sourceLabel}</a>
              <p className="v2-fine">Checked {r.checkedOn}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="v2-wrap v2-cover" aria-labelledby="cover-title">
        <h2 id="cover-title">Where it works today.</h2>
        <div className="v2-cover-grid">
          <div>
            <h3>Full rules and checklists</h3>
            <p>Mecklenburg, Cabarrus and Catawba counties.</p>
          </div>
          <div>
            <h3>Office contacts and sourced facts</h3>
            <p>{DIRECTORY_COUNTIES.join(", ")}.</p>
          </div>
          <div>
            <h3>Next</h3>
            <p>More North Carolina counties. Tell us where you pull permits and we&apos;ll add it sooner.</p>
          </div>
        </div>
      </section>

      <section className="v2-cta" aria-labelledby="cta-title">
        <div className="v2-wrap v2-cta-in">
          <h2 id="cta-title">Be one of the first contractors to shape it.</h2>
          <p>Tell us about your last permit: what slowed it down and what you wish you had known. We&apos;ll build the next feature around it.</p>
          <div className="v2-actions">
            <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className="v2-btn v2-btn-ink">Tell us about your last permit</a>
            <Link href="/planner" className="v2-btn v2-btn-line-ink">Plan a project</Link>
          </div>
        </div>
      </section>

      <div className="v2-foot">
        <div className="v2-wrap v2-foot-in">
          <span>Permivo. Early prototype. Not legal advice.</span>
          <nav aria-label="Footer">
            <Link href="/planner">Planner</Link>
            <Link href="/checklist">Checklist</Link>
            <Link href="/review">Review</Link>
            <Link href="/ask">Ask</Link>
            <Link href="/tracker">Tracker</Link>
            <Link href="/rules">Rules</Link>
            <Link href="/about">About</Link>
            <Link href="/disclaimer">Disclaimer</Link>
          </nav>
        </div>
      </div>
    </main>
  );
}
