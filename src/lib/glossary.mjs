// Glossary terms. Each term gets auto-linked in notion/primer/flavors prose
// to its definition elsewhere on the site, with a native browser tooltip on
// hover and a dotted-underline style to mark it.
//
// Keep `term` canonical (case matters: match is case-sensitive). Add aliases
// as separate entries if needed.
export const glossary = [
  {
    term: "PPT",
    url: "/primer/#probabilistic-polynomial-time-ppt",
    title:
      "Probabilistic polynomial-time: the standard model of an efficient adversary.",
  },
  {
    term: "negligible",
    url: "/primer/#negligible-functions",
    title:
      "A function that vanishes faster than the inverse of any polynomial in the security parameter.",
  },
  {
    term: "game hopping",
    url: "/primer/#game-hopping",
    title:
      "Proof technique walking through a sequence of games to bound the adversary's advantage.",
  },
  {
    term: "game-hopping",
    url: "/primer/#game-hopping",
    title:
      "Proof technique walking through a sequence of games to bound the adversary's advantage.",
  },
  {
    term: "hybrid argument",
    url: "/primer/#hybrid-arguments",
    title:
      "A game-hopping specialization used to reduce multi-challenge security to single-challenge security.",
  },
  {
    term: "circular security",
    url: "/primer/#circular-security",
    title:
      "Security of a scheme when the secret key is encrypted under its own public key.",
  },
];
