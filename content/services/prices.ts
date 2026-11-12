// Prices for the service pages, read from content/pricing.ts so the two never drift apart.
// Rename an add-on there and the build fails here, instead of a service page showing an old price.

import { addOns, care, packages, usd, type Package } from "@/content/pricing";

function pkg(id: Package["id"]) {
  const p = packages.items.find((item) => item.id === id);
  if (!p) throw new Error(`content/services/prices.ts: no "${id}" package in content/pricing.ts`);
  return usd(p.once);
}

function addOn(name: string) {
  const a = addOns.items.find((item) => item.name === name);
  if (!a) throw new Error(`content/services/prices.ts: no add-on called "${name}" in content/pricing.ts`);
  return usd(a.price);
}

function carePlan(id: string) {
  const plan = care.plans.find((p) => p.id === id);
  if (!plan) throw new Error(`content/services/prices.ts: no "${id}" care plan in content/pricing.ts`);
  return `${usd(plan.price)}/mo`;
}

export const price = {
  launch: pkg("launch"),
  grow: pkg("grow"),
  run: pkg("run"),
  extraPage: addOn("Extra page"),
  booking: addOn("Online booking setup"),
  googleProfile: addOn("Google Business Profile setup"),
  automation: addOn("Custom automation"),
  speedFix: addOn("Speed fix for an existing site"),
  email: addOn("Business email setup"),
  hosted: carePlan("hosted"),
  handled: carePlan("handled"),
  growth: carePlan("growth"),
};
