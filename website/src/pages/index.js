import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import styles from "../css/index.module.css";

const features = [
  {
    title: "Plan from telemetry",
    description:
      "Use real product signals to decide what deserves automated coverage first.",
  },
  {
    title: "Generate Playwright tests",
    description:
      "Turn risk-based test plans into executable checks with a repeatable workflow.",
  },
  {
    title: "Heal with feedback",
    description:
      "Use failures, traces, and observability data to improve the next test iteration.",
  },
];

export default function Home() {
  return (
    <Layout
      title="Agentic QA Loop"
      description="Telemetry-driven Playwright planning, generation, and healing"
    >
      <main>
        <section className={styles.hero}>
          <div className="container">
            <p className={styles.kicker}>Playwright agentic testing demo</p>

            <h1 className={styles.title}>
              Build tests that learn from product telemetry.
            </h1>

            <p className={styles.subtitle}>
              Agentic QA Loop shows how to connect observability, planning, test
              generation, and healing into one practical Playwright workflow.
            </p>

            <div className={styles.actions}>
              <Link
                className="button button--primary button--lg"
                to="/docs/tutorial/intro"
              >
                Start tutorial
              </Link>

              <Link
                className="button button--secondary button--lg"
                to="/docs/tutorial/workspace-setup"
              >
                Set up workspace
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.grid}>
              {features.map((feature) => (
                <article className={styles.card} key={feature.title}>
                  <h2>{feature.title}</h2>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
