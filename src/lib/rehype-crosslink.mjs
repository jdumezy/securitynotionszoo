// Auto-linker for notion acronyms and glossary terms.
//
// Walks every text node in notion/primer/flavors prose and wraps occurrences
// of known acronyms (CPA, CCA2, funcCPA, ...) with links to the corresponding
// notion page, and occurrences of glossary terms (PPT, negligible, ...) with
// dotted-underline links to the primer section defining them.
//
// Behavior details:
// - Case-sensitive matches, whole-word-ish boundaries that exclude both `\w`
//   and `-`, so "IND-CPA" does NOT match "CPA" (would be weird to split a
//   combo term mid-word).
// - Skips text nodes inside <a>, <code>, <pre>, <kbd>, <var>, <samp>, <svg>,
//   <mjx-container>: we don't want to touch code blocks, existing links, or
//   MathJax SVG output.
// - On a notion's own page, its own acronym is NOT linked (no self-links).
// - Applies only to source files under src/content/{notions,primer,flavors}.
//   Quiz questions are skipped (they already carry a relatedNotion link).
import { visitParents } from "unist-util-visit-parents";

const SKIP_TAGS = new Set([
  "a",
  "code",
  "pre",
  "kbd",
  "var",
  "samp",
  "svg",
  "mjx-container",
]);

// Auto-linking only runs on notion pages. Primer and flavors are the
// definitional pages themselves: turning their prose into a forest of
// inline links adds visual noise without benefit (the reader landed there
// to read the definitions, not to click through to notions).
const APPLY_MATCHERS = [/content[/\\]notions[/\\]/];

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sourcePath(file) {
  if (!file) return "";
  return file.path || (file.history && file.history[0]) || "";
}

function shouldApply(file) {
  const p = sourcePath(file);
  return APPLY_MATCHERS.some((r) => r.test(p));
}

function currentNotionSlug(file) {
  const p = sourcePath(file);
  const m = p.match(/notions[/\\]([^/\\]+)\.mdx$/);
  return m ? m[1] : null;
}

// Figure out which public URL the current source file renders to, so we can
// drop glossary matches that point to the same page (would self-link).
function currentPageUrl(file) {
  const p = sourcePath(file);
  if (/notions[/\\]([^/\\]+)\.mdx$/.test(p)) {
    const m = p.match(/notions[/\\]([^/\\]+)\.mdx$/);
    return `/notions/${m[1]}/`;
  }
  if (/content[/\\]primer\.mdx$/.test(p)) return "/primer/";
  if (/content[/\\]flavors\.mdx$/.test(p)) return "/flavors/";
  return "";
}

export default function rehypeCrosslink(options = {}) {
  const { notions = [], glossary = [] } = options;

  // Lookup from canonical match string → entry info
  const lookup = new Map();
  for (const n of notions) {
    if (!lookup.has(n.acronym)) {
      lookup.set(n.acronym, { kind: "notion", acronym: n.acronym, slug: n.slug });
    }
  }
  for (const g of glossary) {
    // Glossary terms don't override notion acronyms (notions win ties)
    if (!lookup.has(g.term)) {
      lookup.set(g.term, {
        kind: "gloss",
        term: g.term,
        url: g.url,
        title: g.title,
      });
    }
  }

  // Build one regex, longest-match-first
  const keys = [...lookup.keys()].sort((a, b) => b.length - a.length);
  if (keys.length === 0) {
    return () => {};
  }
  const alternation = keys.map(escapeRegex).join("|");
  const pattern = new RegExp(
    `(?<![\\w-])(${alternation})(?![\\w-])`,
    "g",
  );

  return (tree, file) => {
    if (!shouldApply(file)) return;
    const selfSlug = currentNotionSlug(file);
    const selfPageUrl = currentPageUrl(file);

    // First-occurrence-only: each acronym / glossary term gets linked at
    // most once per file. Wikipedia does this and it keeps prose clean
    // while still being useful.
    const linkedKeys = new Set();
    const mutations = [];

    visitParents(tree, "text", (node, ancestors) => {
      for (const anc of ancestors) {
        if (anc.type === "element" && SKIP_TAGS.has(anc.tagName)) return;
      }
      const text = node.value;
      if (!text) return;
      pattern.lastIndex = 0;
      if (!pattern.test(text)) return;
      pattern.lastIndex = 0;

      const parts = [];
      let lastIndex = 0;
      let match;
      let changed = false;
      while ((match = pattern.exec(text)) !== null) {
        const matched = match[1];
        const info = lookup.get(matched);
        if (!info) continue;
        if (info.kind === "notion" && info.slug === selfSlug) continue;
        if (
          info.kind === "gloss" &&
          selfPageUrl &&
          info.url.startsWith(selfPageUrl)
        ) {
          continue;
        }
        if (linkedKeys.has(matched)) continue;

        if (match.index > lastIndex) {
          parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
        }
        if (info.kind === "notion") {
          parts.push({
            type: "element",
            tagName: "a",
            properties: {
              href: `/notions/${info.slug}/`,
              className: ["auto-link"],
              "data-auto-link": "notion",
            },
            children: [{ type: "text", value: matched }],
          });
        } else {
          parts.push({
            type: "element",
            tagName: "a",
            properties: {
              href: info.url,
              className: ["glossary-link"],
              title: info.title,
              "data-auto-link": "gloss",
            },
            children: [{ type: "text", value: matched }],
          });
        }
        lastIndex = match.index + matched.length;
        changed = true;
        linkedKeys.add(matched);
      }

      if (!changed) return;
      if (lastIndex < text.length) {
        parts.push({ type: "text", value: text.slice(lastIndex) });
      }

      const parent = ancestors[ancestors.length - 1];
      mutations.push({ parent, node, parts });
    });

    // Apply mutations after traversal so the live tree isn't modified
    // while it's being walked.
    for (const m of mutations) {
      const idx = m.parent.children.indexOf(m.node);
      if (idx >= 0) m.parent.children.splice(idx, 1, ...m.parts);
    }
  };
}
