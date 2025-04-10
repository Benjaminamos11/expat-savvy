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

export const collections = {
  providers
};