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

const insurers = defineCollection({
  type: 'content',
  schema: z.object({
    // Required fields
    name: z.string(),
    
    // Hero section
    hero: z.object({
      title: z.string(),
      subtitle: z.string(),
      backgroundUrl: z.string()
    }),
    
    // Facts table data
    brandUrl: z.string().optional(),
    founded: z.string(),
    hq: z.string(),
    marketPosition: z.string(),
    customers: z.string(),
    languages: z.array(z.string()),
    strengths: z.array(z.string()),
    limitations: z.array(z.string()),
    uniquePlans: z.array(z.string()),
    knownFor: z.array(z.string()),
    customerFocus: z.string(),
    premiumExample: z.object({
      location: z.string(),
      value: z.string(),
      year: z.string()
    }),
    premiumTrend: z.string(),
    claimsRating: z.string(),
    
    // Expert section
    expert: z.object({
      quote: z.string(),
      name: z.string(),
      title: z.string(),
      avatarUrl: z.string(),
      languages: z.string(),
      experience: z.string()
    }),
    
    // Comparison links
    internalCompareLinks: z.array(z.object({
      label: z.string(),
      href: z.string()
    })),
    
    // Optional highlights and special features
    highlights: z.array(z.string()).optional(),
    special: z.object({
      gymRebateMax: z.number().optional(),
      hasAgeEntryNote: z.boolean().optional(),
      ageEntryNote: z.string().optional(),
      strictUnderwriting: z.boolean().optional(),
      notableProducts: z.array(z.string()).optional(),
      englishSupportLevel: z.string().optional()
    }).optional(),
    
    // FAQ
    faq: z.array(z.object({
      q: z.string(),
      a: z.string()
    })),
    
    // SEO
    metaDescription: z.string().optional()
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
  insurers,
  'blog': blogCollection,
};