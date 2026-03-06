import { defineCollection, z } from 'astro:content';

const notionsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    acronym: z.string(),
    description: z.string().max(160),
    tags: z.array(z.string()),
    introduced_in: z.array(
      z.object({
        title: z.string(),
        authors: z.array(z.string()),
        year: z.number(),
        link: z.string().url(),
      })
    ),
    implies: z.array(z.string()),
    implied_by: z.array(z.string()),
  }),
});

export const collections = {
  notions: notionsCollection,
};
