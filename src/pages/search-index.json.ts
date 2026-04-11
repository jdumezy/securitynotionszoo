import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import rawPrimer from "../content/primer.mdx?raw";
import rawFlavors from "../content/flavors.mdx?raw";

export interface SearchDoc {
  type: "notion" | "primer" | "flavors" | "transform" | "page";
  id: string;
  url: string;
  title: string;
  subtitle?: string;
  snippet: string;
  body: string;
  tags: string[];
}

// Strip MDX/markdown syntax so the plain text is searchable and short
// snippet-friendly.
function stripMarkdown(md: string): string {
  return md
    .replace(/^---[\s\S]*?---/, "") // drop frontmatter if present
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks
    .replace(/`[^`]*`/g, " ") // inline code
    .replace(/\$\$[\s\S]*?\$\$/g, " ") // display math
    .replace(/\$[^$\n]*\$/g, " ") // inline math
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links → text only
    .replace(/[#>*_~`]/g, " ") // heading/emphasis/quote markers
    .replace(/<[^>]+>/g, " ") // inline HTML
    .replace(/\s+/g, " ")
    .trim();
}

// Split a markdown/MDX body into sections keyed by the nearest heading.
// Both `##` and `###` are treated as section boundaries.
function splitSections(
  body: string,
): Array<{ heading: string; text: string }> {
  const lines = body.split("\n");
  const sections: Array<{ heading: string; text: string }> = [];
  let heading = "";
  let buffer: string[] = [];
  const flush = () => {
    if (heading || buffer.length) {
      sections.push({
        heading,
        text: buffer.join("\n"),
      });
    }
  };
  for (const line of lines) {
    const match = line.match(/^(##{1,2})\s+(.+?)\s*$/);
    if (match) {
      flush();
      heading = match[2].trim();
      buffer = [];
    } else {
      buffer.push(line);
    }
  }
  flush();
  return sections.filter((s) => s.heading);
}

function firstSentence(text: string, maxLen = 180): string {
  const plain = stripMarkdown(text);
  if (!plain) return "";
  const dot = plain.indexOf(". ");
  const first = dot > 0 && dot < maxLen ? plain.slice(0, dot + 1) : plain;
  return first.length > maxLen ? first.slice(0, maxLen - 1) + "\u2026" : first;
}

export const GET: APIRoute = async () => {
  const docs: SearchDoc[] = [];

  // ---- Notions ----
  const notions = await getCollection("notions");
  for (const n of notions) {
    docs.push({
      type: "notion",
      id: n.slug,
      url: `/notions/${n.slug}/`,
      title: n.data.acronym,
      subtitle: n.data.title,
      snippet: n.data.description,
      body: stripMarkdown(n.body),
      tags: n.data.tags,
    });
  }

  // ---- Primer sections ----
  const primerSections = splitSections(rawPrimer);
  for (const s of primerSections) {
    docs.push({
      type: "primer",
      id: `primer:${s.heading}`,
      url: "/primer/",
      title: s.heading,
      subtitle: "Security Primer",
      snippet: firstSentence(s.text),
      body: stripMarkdown(s.text),
      tags: ["primer"],
    });
  }

  // ---- Flavors sections ----
  const flavorsSections = splitSections(rawFlavors);
  for (const s of flavorsSections) {
    docs.push({
      type: "flavors",
      id: `flavors:${s.heading}`,
      url: "/flavors/",
      title: s.heading,
      subtitle: "Security Flavors",
      snippet: firstSentence(s.text),
      body: stripMarkdown(s.text),
      tags: ["flavors"],
    });
  }

  // ---- Transforms (all land on /map/; the side panel displays them) ----
  const transforms = await getCollection("transforms");
  for (const t of transforms) {
    const routeLabel = `${t.data.from.join(" + ")} \u2192 ${t.data.to}`;
    docs.push({
      type: "transform",
      id: `transform:${t.slug}`,
      url: "/map/",
      title: t.data.name,
      subtitle: routeLabel,
      snippet:
        t.data.assumption
          ? `${routeLabel}. Assumption: ${t.data.assumption}.`
          : routeLabel,
      body: stripMarkdown(t.body),
      tags: ["transform", t.data.category, ...(t.data.tags ?? [])],
    });
  }

  // ---- Top-level pages ----
  docs.push({
    type: "page",
    id: "page:about",
    url: "/about/",
    title: "About",
    subtitle: "Why this site exists",
    snippet:
      "About SecurityNotionsZoo: motivation, aim, contributors, and how to contribute.",
    body: "about motivation aim contributors contribute",
    tags: ["about"],
  });
  docs.push({
    type: "page",
    id: "page:games-quiz",
    url: "/games/quiz/",
    title: "Quiz",
    subtitle: "Game",
    snippet:
      "Multiple-choice questions on acronyms, implications, definitions, and attack models.",
    body: "quiz game questions multiple choice",
    tags: ["game", "quiz"],
  });
  docs.push({
    type: "page",
    id: "page:games-reorder",
    url: "/games/reorder/",
    title: "Recreate the graph",
    subtitle: "Game",
    snippet:
      "Rebuild the implication graph of security notions by drawing arrows between nodes.",
    body: "reorder graph recreate game implication arrows",
    tags: ["game", "reorder"],
  });
  docs.push({
    type: "page",
    id: "page:games-designer",
    url: "/games/designer/",
    title: "Build the adversary",
    subtitle: "Game",
    snippet:
      "For each security notion, pick the oracles and capabilities that define its adversary's game.",
    body: "designer adversary oracles capabilities game pre-challenge post-challenge randomness",
    tags: ["game", "designer", "adversary"],
  });
  docs.push({
    type: "page",
    id: "page:notions-all",
    url: "/notions/all/",
    title: "All security notions",
    subtitle: "Detailed list",
    snippet:
      "Complete dictionary of every cryptographic security game and definition cataloged.",
    body: "all notions full list complete detailed",
    tags: ["directory"],
  });
  docs.push({
    type: "page",
    id: "page:map",
    url: "/map/",
    title: "Constructions map",
    subtitle: "Transforms between notions",
    snippet:
      "A map of the known transforms that lift schemes from one security notion to another: Naor-Yung, Fujisaki-Okamoto, noise flooding, the vCCA framework, and more.",
    body: "map constructions transforms naor-yung fujisaki-okamoto noise flooding vcca framework routes",
    tags: ["map"],
  });

  return new Response(JSON.stringify({ docs }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
