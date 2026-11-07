// GROQ for every Sanity-backed page. Result shapes live in ./types.ts.
// "Live" means published (the client only reads published docs) and not scheduled in the future.

const IMAGE = `{
  asset, crop, hotspot, alt, caption,
  "lqip": asset->metadata.lqip,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height
}`;

const LIVE_POST = `_type == "post" && defined(slug.current) && (!defined(publishedAt) || publishedAt <= now())`;

// ~220 words a minute, five characters a word. Never shows "0 min read".
const POST_CARD = `
  _id, title, excerpt, publishedAt, featured, format,
  "slug": slug.current,
  "readMinutes": math::max([1, round(length(pt::text(body)) / 5 / 220)]),
  "image": image${IMAGE},
  "category": categories[0]->{ title, "slug": slug.current }
`;

const CASE_STUDY_CARD = `
  _id, excerpt, location,
  "slug": slug.current,
  "name": coalesce(businessName, testimonial.authorBusiness, title),
  "sector": string::split(industry, ",")[0],
  "image": coverImage${IMAGE}
`;

export const BLOG_INDEX_QUERY = `*[${LIVE_POST}] | order(publishedAt desc) { ${POST_CARD} }`;

export const POST_SLUGS_QUERY = `*[${LIVE_POST}].slug.current`;

export const POST_QUERY = `*[${LIVE_POST} && slug.current == $slug][0]{
  ${POST_CARD},
  "updatedAt": _updatedAt,
  seo,
  "categories": categories[]->{ title, "slug": slug.current },
  body[]{
    ...,
    _type == "image" => ${IMAGE},
    _type == "calloutCard" => {
      ...,
      "image": image${IMAGE},
      "target": target->{
        _type, "slug": slug.current,
        "title": select(_type == "caseStudy" => coalesce(businessName, title), title),
        excerpt,
        "image": coalesce(coverImage, image)${IMAGE}
      }
    }
  },
  "pickedCaseStudies": relatedCaseStudies[]->{ ${CASE_STUDY_CARD} },
  "latestCaseStudies": *[_type == "caseStudy" && defined(slug.current)] | order(featured desc, publishedAt desc)[0...3]{ ${CASE_STUDY_CARD} },
  "sameCategory": *[${LIVE_POST} && _id != ^._id && count(categories[@._ref in ^.^.categories[]._ref]) > 0] | order(publishedAt desc)[0...3]{ ${POST_CARD} },
  "latest": *[${LIVE_POST} && _id != ^._id] | order(publishedAt desc)[0...3]{ ${POST_CARD} }
}`;

export const INDUSTRIES_QUERY = `*[_type == "industry" && defined(slug.current)] | order(coalesce(sortOrder, 999) asc, name asc){
  _id, name, group, line, clientWork, href,
  "slug": slug.current,
  "image": image${IMAGE},
  "caseStudy": caseStudies[0]->{ "slug": slug.current, "name": coalesce(businessName, testimonial.authorBusiness, title) }
}`;

export const CASE_STUDY_SLUGS_QUERY = `*[_type == "caseStudy" && defined(slug.current)].slug.current`;

export const CASE_STUDY_QUERY = `*[_type == "caseStudy" && slug.current == $slug][0]{
  ${CASE_STUDY_CARD},
  title, publishedAt, headline, facts, summary, problemHeading, beforeAfter,
  steps, results, resultsChart, outcomes, takeaways, underTheHood, techStack,
  problem, solution, systemBuilt, seo,
  "updatedAt": _updatedAt,
  "beforeImage": beforeImage${IMAGE},
  "afterImage": afterImage${IMAGE},
  "gallery": gallery[]${IMAGE},
  testimonial{ quote, authorName, authorBusiness, "authorPhoto": authorPhoto${IMAGE} },
  "industryPage": *[_type == "industry" && references(^._id)][0]{ name, "slug": slug.current },
  // Filter the references (keeps the Studio order), then follow them. Skips unpublished or future posts.
  "pickedPosts": relatedPosts[defined(@->slug.current) && (!defined(@->publishedAt) || @->publishedAt <= now())]->{ ${POST_CARD} },
  "latestPosts": *[${LIVE_POST}] | order(publishedAt desc)[0...3]{ ${POST_CARD} }
}`;

/** Lightweight list for the sitemap and RSS feed. */
export const FEED_QUERY = `{
  "posts": *[${LIVE_POST}] | order(publishedAt desc){
    title, excerpt, publishedAt, "slug": slug.current, "updatedAt": _updatedAt, "seoDescription": seo.description
  },
  "caseStudies": *[_type == "caseStudy" && defined(slug.current)] | order(publishedAt desc){
    "slug": slug.current, "updatedAt": _updatedAt
  }
}`;
