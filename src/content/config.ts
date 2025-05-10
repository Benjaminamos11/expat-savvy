import { defineCollection, z } from 'astro:content';

const providers = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    logo: z.string(),
    description: z.string(),
    features: z.array(z.object({
      title: z.string(),
      description: z.string()
    })).optional(),
    supplementaryPlans: z.array(z.object({
      name: z.string(),
      description: z.string(),
      benefits: z.array(z.string())
    })).optional()
  })
});

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional().nullable(),
    date: z.union([z.date(), z.string(), z.null()]).optional(),
    description: z.string().optional().nullable(),
    author: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
  }),
});

export const collections = {
  providers,
  'blog': blogCollection,
};