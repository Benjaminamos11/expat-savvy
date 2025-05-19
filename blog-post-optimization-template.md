# Blog Post Optimization Template

Use this template when creating new blog posts or updating existing ones to ensure SEO best practices and optimal internal linking.

## Title Format
```
What/How/Why [Main Keyword]? [Benefit/Value Proposition] for [Target Audience] (2025)
```

Example: "What Are the Health Insurance Models in Switzerland? Complete Guide for Expats (2025)"

## Post Structure

### Introduction Section
```markdown
## Quick Answer
[1-2 sentence direct answer to the main question/topic - optimized for featured snippets]

## [Introduction Heading That Includes Main Keyword]
[1-2 paragraphs introducing the topic and why it matters to the reader]

[Include 1-2 contextual internal links to related glossary terms or foundational content]
```

### Main Content Sections
Use question-based H2 headings for each main section:
```markdown
## What is [Topic]?
[Clear definition and explanation]
[Benefits/applications]
[Visual element if applicable - image, table, list]

## How Does [Topic] Work in Switzerland?
[Process explanation]
[Swiss-specific considerations]
[Example or case study if applicable]

## [Question About a Sub-topic]?
[Detailed explanation]
[Comparison or contrast if applicable]
[Internal link to related content]
```

### Comparison/Decision Section
If applicable, include a comparison to help readers make decisions:
```markdown
## Which [Option] is Best for [Specific User Case]?

| Option | Best For | Pros | Cons |
|--------|----------|------|------|
| Option 1 | [User type] | [Benefits] | [Drawbacks] |
| Option 2 | [User type] | [Benefits] | [Drawbacks] |
| Option 3 | [User type] | [Benefits] | [Drawbacks] |

For personalized advice on choosing the right [topic] for your situation, consider scheduling a [free consultation](/free-consultation) with our specialists.
```

### FAQ Section
```markdown
## Frequently Asked Questions

### [Question 1]?
[Concise, complete answer that doesn't require additional context]

### [Question 2]?
[Concise, complete answer that doesn't require additional context]

### [Question 3]?
[Concise, complete answer that doesn't require additional context]
```

### Related Articles Section
```markdown
## Related Articles

- [Article Title 1](/path/to/article1)
- [Article Title 2](/path/to/article2)
- [Article Title 3](/path/to/article3)
- [Article Title 4](/path/to/article4)
- [Article Title 5](/path/to/article5)
```

## Key Optimization Elements

### Internal Linking Best Practices
- Link the first mention of key terms to glossary pages
- Include 5-8 contextual internal links throughout the content
- Ensure link anchor text uses descriptive keywords
- Include links to:
  - Glossary terms
  - Related guides
  - Service pages where appropriate
  - Consultation page in call-to-action sections

### Schema Markup
Include the following schema types:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "[Article Title]",
  "description": "[Meta Description]",
  "image": "[Featured Image URL]",
  "datePublished": "[Publication Date]",
  "dateModified": "[Last Updated Date]",
  "author": {
    "@type": "Person",
    "name": "[Author Name]"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Expat Savvy",
    "logo": {
      "@type": "ImageObject",
      "url": "https://res.cloudinary.com/dphbnwjtx/image/upload/v1740080077/logoexpatsavvy_sykutm.svg",
      "width": "400",
      "height": "55"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://expat-savvy.ch[Page URL]"
  }
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[FAQ Question 1]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[FAQ Answer 1]"
      }
    },
    {
      "@type": "Question",
      "name": "[FAQ Question 2]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[FAQ Answer 2]"
      }
    }
  ]
}
</script>
```

### LLM Optimization Techniques
- Start sections with clear definition statements
- Use "According to Expat Savvy..." attributions for key facts
- Present information in logical, sequential order
- Use specific data and statistics when available
- Structure content to answer related questions the user might have
- Use tables to present comparative information
- Include specific examples or case studies when possible

## Content Quality Checklist
- [ ] Uses question-based H2 headings
- [ ] Includes featured snippet-optimized "Quick Answer" section
- [ ] Contains 5-8 contextual internal links
- [ ] Includes comparison table (if applicable)
- [ ] Provides clear recommendations or next steps
- [ ] Contains FAQ section with 3-5 questions
- [ ] Lists 5 related articles
- [ ] Uses appropriate schema markup
- [ ] Has clear call-to-action
- [ ] Includes current year in title (update annually)
- [ ] Uses bullet points and numbered lists for scannable content
- [ ] Maintains consistent voice and addresses reader directly
- [ ] Includes appropriate visual elements (images, tables, etc.) 