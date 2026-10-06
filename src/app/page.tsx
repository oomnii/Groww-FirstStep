import Link from "next/link";
import { experienceLabel, personas } from "@/data/personas";
import { formatRupees } from "@/lib/money";

const journey = ["Understand", "Plan", "Simulate", "Protect", "Decide", "Progress"];

export default function HomePage() {
  return (
    <div className="stack">
      <section className="hero">
        <p className="eyebrow">Educational prototype</p>
        <h1>Groww FirstStep</h1>
        <p className="lede">From first paycheck to first confident investment.</p>
        <p className="hero-copy">
          Understand what you can invest, see risk in real rupees, and pressure-test your decision
          before you act.
        </p>
        <div className="cta-row">
          <Link className="btn btn-primary" href="/starter">
            Build my starter plan
          </Link>
          <a className="btn btn-secondary" href="#demo-personas">
            Try a demo persona
          </a>
        </div>
        <ol className="journey" aria-label="Journey">
          {journey.map((stage) => (
            <li key={stage}>{stage}</li>
          ))}
        </ol>
      </section>

      <section className="section" id="demo-personas" aria-labelledby="demo-heading">
        <h2 id="demo-heading">Try a demo persona</h2>
        <p className="section-intro">
          These are fictional starting points. You can edit every number after you open one.
        </p>
        <div className="persona-grid">
          {personas.map((persona) => (
            <article className="card persona-card" key={persona.id}>
              <p className="eyebrow">{persona.code}</p>
              <h3>{persona.name}</h3>
              <p>{persona.summary}</p>
              <dl className="meta-list">
                <div>
                  <dt>Age</dt>
                  <dd>{persona.age}</dd>
                </div>
                <div>
                  <dt>Monthly income</dt>
                  <dd>{formatRupees(persona.monthlyIncome)}</dd>
                </div>
                <div>
                  <dt>Essential expenses</dt>
                  <dd>{formatRupees(persona.essentialExpenses)}</dd>
                </div>
                <div>
                  <dt>Liquid savings</dt>
                  <dd>{formatRupees(persona.liquidSavings)}</dd>
                </div>
                <div>
                  <dt>Experience</dt>
                  <dd>{experienceLabel(persona.investmentExperience)}</dd>
                </div>
              </dl>
              <Link className="btn btn-secondary" href={`/starter?persona=${persona.id}`}>
                Use this demo
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
