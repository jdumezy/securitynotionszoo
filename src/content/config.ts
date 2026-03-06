import { defineCollection, z } from 'astro:content';

const notionsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    acronym: z.string(),
    description: z.string().max(160),
    tags: z.array(z.string()).default([]),
    introduced_in: z.array(
      z.object({
        title: z.string().optional(),
        authors: z.array(z.string()).optional().default([]),
        year: z.number().nullable().optional(),
        link: z.union([z.string().url(), z.literal('')]).optional(),
      })
    ).optional().default([]),
    implies: z.array(z.string()).optional().default([]),
    implied_by: z.array(z.string()).optional().default([]),
  }),
});

export const collections = {
  notions: notionsCollection,
};
