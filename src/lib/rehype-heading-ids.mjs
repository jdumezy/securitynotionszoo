// Adds stable, GitHub-style `id` attributes to every heading so anchor links
// like `/primer/#negligible-functions` actually scroll to the right section.
//
// Uses `github-slugger` (already a transitive dep) to match the conventional
// slug format.
import { visit } from "unist-util-visit";
import GithubSlugger from "github-slugger";

const HEADING = /^h[1-6]$/;

function extractText(node) {
  if (!node) return "";
  if (node.type === "text") return node.value;
  if (node.children) {
    return node.children.map(extractText).join("");
  }
  return "";
}

export default function rehypeHeadingIds() {
  return (tree) => {
    const slugger = new GithubSlugger();
    visit(tree, "element", (node) => {
      if (!HEADING.test(node.tagName)) return;
      node.properties = node.properties || {};
      if (node.properties.id) return;
      const text = extractText(node).trim();
      if (!text) return;
      node.properties.id = slugger.slug(text);
    });
  };
}
