import { ArrowRight, Database, Lock, Search, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SyntheticDataNotice } from "@/components/synthetic-data-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

const METRICS = [
  { label: "Coded SLE cases", hint: "ICD-10 M32 and SNOMED", stage: 2 },
  { label: "Likely uncoded cases", hint: "Labs, meds and note evidence", stage: 2 },
  { label: "Records indexed", hint: "De-identified research schema", stage: 1 },
];

const PIPELINE = [
  {
    icon: Database,
    title: "Ingest and de-identify",
    body: "Synthea records land in a protected schema. Names are stripped, dates shifted and IDs replaced before anything reaches research views.",
  },
  {
    icon: Search,
    title: "Find cases",
    body: "Diagnosis codes, EULAR/ACR-style lab and medication evidence, and negation-aware search over clinical notes.",
  },
  {
    icon: Sparkles,
    title: "Explain with citations",
    body: "Cited case summaries generated only from de-identified text, after a PII check blocks any identifier.",
  },
];

export default function Home() {
  return (
    <AppShell activeHref="/">
      <div className="flex flex-col gap-8">
        <section aria-labelledby="page-title" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">Stage 0 · Setup</Badge>
            <Badge tone="neutral">
              <Lock aria-hidden="true" />
              Security baseline on
            </Badge>
          </div>
          <h1 id="page-title" className="text-3xl font-semibold tracking-tight text-fg text-balance">
            Lupus Case Finder
          </h1>
          <p className="max-w-2xl text-lg text-fg-muted text-pretty">
            Surface documented and likely-missed systemic lupus erythematosus cases across synthetic
            patient records, with every finding traced back to its evidence.
          </p>
        </section>

        <SyntheticDataNotice />

        <section aria-labelledby="metrics-title">
          <h2 id="metrics-title" className="sr-only">
            Key metrics
          </h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {METRICS.map((m) => (
              <li key={m.label}>
                <Card className="h-full">
                  <CardHeader>
                    <CardDescription>{m.label}</CardDescription>
                    <p className="font-mono text-2xl text-fg-subtle" aria-label="No data yet">
                      —
                    </p>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-xs text-fg-subtle">
                    <span>{m.hint}</span>
                    <span className="font-mono">Stage {m.stage}</span>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <Card aria-labelledby="search-title">
          <CardHeader>
            <CardTitle id="search-title">Search de-identified notes</CardTitle>
            <CardDescription>Hybrid keyword and semantic search arrives in stage 2.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-2 sm:flex-row sm:items-end" aria-describedby="search-help">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="note-search">Query</Label>
                <Input id="note-search" name="q" placeholder="e.g. malar rash with photosensitivity" disabled />
              </div>
              <Button type="submit" disabled>
                Search
                <ArrowRight aria-hidden="true" />
              </Button>
            </form>
            <p id="search-help" className="mt-2 text-xs text-fg-subtle">
              Queries will run only against the research schema, never against identifiable records.
            </p>
          </CardContent>
        </Card>

        <section aria-labelledby="pipeline-title" className="flex flex-col gap-4">
          <h2 id="pipeline-title" className="text-sm font-medium uppercase tracking-wider text-fg-subtle">
            How it works
          </h2>
          <ol className="grid gap-4 md:grid-cols-3">
            {PIPELINE.map(({ icon: Icon, title, body }, i) => (
              <li key={title}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <span className="grid size-8 place-items-center rounded-md bg-surface-raised ring-1 ring-border-strong">
                        <Icon aria-hidden="true" className="size-4 text-accent" />
                      </span>
                      <span className="font-mono text-xs text-fg-subtle">0{i + 1}</span>
                    </div>
                    <CardTitle className="mt-3">{title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-fg-muted">{body}</CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <Card>
          <CardFooter className="flex-wrap justify-between border-t-0 text-xs text-fg-subtle">
            <span>Open source under the MIT license.</span>
            <a
              className="text-fg-muted underline-offset-4 hover:text-fg hover:underline"
              href="https://github.com/jcsabino29/lupus-case-finder"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}
