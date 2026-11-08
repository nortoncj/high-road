/**
 * Starter copy for each industry page (/industries/<slug>). The seed only fills fields that are
 * empty, so rewrite anything here in the Studio and it stays yours.
 *
 * Stats: only numbers with a public source. Swap in industry-specific ones as you find them.
 */

type Stat = { value: string; label: string; source: string; sourceUrl: string };

const HBR = "https://hbr.org/2011/03/the-short-life-of-online-sales-leads";

const STATS = {
  speed: {
    value: "7×",
    label: "more likely to get a real conversation when a web lead is called back within the hour instead of an hour later.",
    source: "Harvard Business Review, 2011",
    sourceUrl: HBR,
  },
  silent: {
    value: "23%",
    label: "of 2,241 U.S. companies never answered a test web inquiry at all. Their competitors got the job.",
    source: "Harvard Business Review, 2011",
    sourceUrl: HBR,
  },
  reviews: {
    value: "4%",
    label: "of consumers say they never read online reviews of local businesses. The other 96% are reading yours.",
    source: "BrightLocal Local Consumer Review Survey, 2025",
    sourceUrl: "https://www.brightlocal.com/research/local-consumer-review-survey-2025/",
  },
} satisfies Record<string, Stat>;

export type IndustryPage = {
  eyebrow?: string;
  headline: string;
  intro: string;
  stats: (keyof typeof STATS)[];
  problems: [title: string, body: string][];
  solutions: [title: string, body: string, points?: string[]][];
  faqs: [question: string, answer: string][];
  cta?: { heading?: string; body?: string; secondaryLabel?: string; secondaryHref?: string };
};

export const statFor = (k: keyof typeof STATS) => STATS[k];

// Shared answers. Prices live on /pricing so they never go stale here.
const PRICE_FAQ: [string, string] = [
  "What does it cost?",
  "Every project gets a fixed price before any work starts, and you can pay once or spread it over 12 months. The packages and prices are on the pricing page. On the free call I'll tell you which one fits, or if you don't need me at all.",
];
const UPDATE_FAQ: [string, string] = [
  "Can I update it myself?",
  "Yes. Photos, hours, prices and specials are all things you can change from your phone. If you'd rather not, send me a text and I'll do it.",
];

export const INDUSTRY_PAGES: Record<string, IndustryPage> = {
  "contractors-and-remodelers": {
    headline: "Show off the work, and stop losing estimate requests",
    intro:
      "Homeowners pick a contractor by looking at past jobs, reading reviews, then filling out a form. I build sites where all three work: a gallery that sells the job, reviews front and center, and an estimate form that actually reaches you.",
    stats: ["speed", "silent", "reviews"],
    problems: [
      ["Estimate requests go missing", "The form says thanks, then the email never shows up. You don't find out until a customer mentions it, if they ever do."],
      ["Twenty years of work, three photos online", "Your best jobs live on your phone. Homeowners comparing contractors can't see any of them."],
      ["Everything is crammed on one page", "Kitchens, decks, drywall and painting all share one page, so Google doesn't know which one to send people to."],
    ],
    solutions: [
      ["An estimate form that always lands", "Sent through a real email service, with a text to your phone the moment it comes in.", ["Text alert for every new request", "Photo upload so they can show you the job", "Tested monthly"]],
      ["A gallery you can filter by job type", "Before and after photos sorted by kitchens, baths, decks and more. Add new ones from your phone in a minute."],
      ["A page for each service you sell", "One page per service, and one per town you work in, so you show up for exactly what people search."],
      ["Your Google Business Profile, filled out", "Photos, services, hours and a simple way to ask happy customers for a review."],
    ],
    faqs: [
      ["I get most of my work from referrals. Why do I need a website?", "Referrals still look you up. When a neighbor gives them your name, they check your site and your reviews before they call. A good site turns that referral into a booked estimate instead of a maybe."],
      ["I don't have good photos of my work. Is that a problem?", "No. Phone photos are fine, and I'll show you what to shoot on your next few jobs. Real photos of your work beat stock photos every time."],
      PRICE_FAQ,
    ],
  },

  "custom-woodworking": {
    headline: "Let the craft sell itself, then make ordering easy",
    intro:
      "People buying a custom table or countertop want to see the grain, the joinery and the guy who made it. I build sites that show the work up close, explain your process, and turn admirers into custom orders.",
    stats: ["reviews", "speed", "silent"],
    problems: [
      ["Your work lives on Facebook", "Your best pieces are buried in a feed, and you don't control who sees them or when the platform changes the rules."],
      ["Nobody knows how a custom order works", "Buyers aren't sure what it costs, how long it takes or what to send you, so they don't ask."],
      ["The site doesn't match the quality of the work", "A rough logo and a template page make a premium piece look like a weekend project."],
    ],
    solutions: [
      ["A gallery that shows the detail", "Big, sharp photos sorted by piece type, with the wood species and a short story for each one."],
      ["A clear custom order process", "How it works, typical price ranges and lead times, and a request form that asks for size, wood and budget.", ["Request form with photo upload", "Text alert for new orders", "Price ranges that filter out bargain hunters"]],
      ["Your story, told well", "Who you are, how you learned and why you care about the wood. That story is why people pay more."],
    ],
    faqs: [
      ["Should I list prices for custom work?", "Ranges, yes. \"Most end-grain countertops run between X and Y\" saves you from quoting people who were never going to buy, and makes serious buyers more comfortable reaching out."],
      UPDATE_FAQ,
      PRICE_FAQ,
    ],
  },

  "restaurants-and-pop-ups": {
    headline: "Menus, hours and where you are this week, right where hungry people look",
    intro:
      "Hungry people decide fast. They want the menu, the hours and directions in two taps, on their phone. I build quick, simple sites that answer those three questions and keep your Google listing in step.",
    stats: ["reviews", "silent"],
    problems: [
      ["The menu is a blurry PDF", "It takes forever to load on a phone, can't be read without zooming, and Google can't read it at all."],
      ["Your hours are wrong somewhere", "The site says one thing, Google says another, and a customer shows up to a locked door."],
      ["Pop-up locations get lost", "This week's spot is in an Instagram story that disappeared yesterday."],
    ],
    solutions: [
      ["A real menu, not a PDF", "Fast to load, easy to read on a phone, and simple for you to update when prices change."],
      ["One place for hours and locations", "Update it once and it shows on the site. For pop-ups, a \"where we are this week\" spot right at the top."],
      ["Catering and event requests that reach you", "A short form for parties and catering, with a text to your phone so big orders don't sit."],
      ["A Google listing that matches", "Hours, photos, menu link and holiday hours kept in sync with your site."],
    ],
    faqs: [
      ["Do I need a website if I'm on Instagram?", "Instagram is great for showing food. It's bad at answering \"are you open right now?\" A simple site gives Google something to show and gives customers one place to check."],
      UPDATE_FAQ,
      PRICE_FAQ,
    ],
  },

  "senior-living-and-home-care": {
    headline: "Help families trust you before they ever visit",
    intro:
      "Families choosing care are worried and comparing options late at night. I build warm, easy-to-read sites that answer their questions, show real people, and make the call to you feel safe.",
    stats: ["speed", "silent", "reviews"],
    problems: [
      ["The 9pm call goes to voicemail", "A daughter finally has time to look after work. If nobody answers, she calls the next agency on the list."],
      ["Families land on lead sites, not on you", "Directories sell your inquiry to five competitors at once."],
      ["The site is hard to read", "Small gray text and tiny buttons, for the very people who need large type most."],
    ],
    solutions: [
      ["Built for every age", "Large type, strong contrast and plain language for the dad and the daughter helping him."],
      ["Catch the after-hours inquiry", "Click-to-call on every page, plus a short form that texts you the moment it's sent.", ["Text alert for every inquiry", "Short, kind forms", "Spanish version available"]],
      ["Real faces, real reviews", "Your team and your residents, with permission. Families trust people they can see."],
      ["A careers page that hires", "Caregivers apply from their phone in a couple of minutes."],
    ],
    faqs: [
      ["Can the site help with hiring caregivers too?", "Yes. Every home care site I build includes a careers page and a short mobile application, so you're not living on job boards."],
      ["Do you build Spanish versions?", "Yes. Many families in Florida are more comfortable reading in Spanish, and a Spanish version shows them you'll understand them on the phone, too."],
      PRICE_FAQ,
    ],
    cta: { secondaryLabel: "See the home care package", secondaryHref: "/services" },
  },

  "tiny-homes-and-containers": {
    headline: "Give serious buyers the floor plans, prices and next step they're hunting for",
    intro:
      "Tiny home and container buyers research for weeks before they reach out. I build sites that answer their questions up front with floor plans, price ranges and financing, so the people who contact you are ready to talk.",
    stats: ["speed", "silent", "reviews"],
    problems: [
      ["Buyers can't find a price", "No ranges, so they assume it's out of budget, or they email just to ask and never reply."],
      ["Every build is a custom conversation", "You explain layouts, options and delivery from scratch on every call."],
      ["Financing scares people off", "They love the model but have no idea how they'd pay for it."],
    ],
    solutions: [
      ["Model pages with floor plans", "Each model with photos, a floor plan, square footage and a starting price."],
      ["A design request that does the first call for you", "Buyers pick a model, options and budget before they hit send.", ["Model and option picker", "Budget and timeline questions", "Text alert for every request"]],
      ["Clear financing and delivery info", "How payment works, where you deliver and how long a build takes, in plain English."],
    ],
    faqs: [
      ["Can buyers design their own layout on the site?", "Yes. A design request flow lets buyers pick a model, layout options and a budget before they reach out, so you start from a real plan instead of \"how much?\""],
      UPDATE_FAQ,
      PRICE_FAQ,
    ],
  },

  "travel-and-professional-services": {
    headline: "Turn expertise into booked consultations",
    intro:
      "When you sell what you know, people buy trust first. I build sites that show your credentials, your clients' results and an easy way to book time with you.",
    stats: ["speed", "silent", "reviews"],
    problems: [
      ["People don't know what you actually do", "The site lists services but never says who you help or what it's like to work with you."],
      ["Booking takes five emails", "Back and forth to find a time loses people who were ready to say yes."],
      ["Nobody finds you on Google", "No blog, no service pages, so the only visitors are people who already know your name."],
    ],
    solutions: [
      ["A clear offer, in plain English", "Who you help, what you do and what happens next, on the first screen."],
      ["Online booking for consultations", "Let people pick a time on your calendar without the email tag.", ["Calendar booking", "Short intake questions", "Reminders so people show up"]],
      ["A blog and Google profile that bring in strangers", "Helpful articles and a filled-out Business Profile, so people searching find you instead of a big directory."],
    ],
    faqs: [
      ["Do I need a blog?", "If you want people who don't know you yet to find you, yes. Two helpful posts a month, answering real client questions, does more than a fancy homepage."],
      UPDATE_FAQ,
      PRICE_FAQ,
    ],
  },

  hvac: {
    headline: "Book the emergency call before they try the next company",
    intro:
      "When the AC dies in August, people call whoever shows up first on their phone and actually picks up. I build HVAC sites that get you in front of them and make calling you the easiest thing on the screen.",
    stats: ["speed", "silent", "reviews"],
    problems: [
      ["The call comes in while you're in an attic", "It rolls to voicemail and the customer has already called two other companies before you climb down."],
      ["Every company looks the same", "Same stock photo of a smiling tech, same \"quality service\" line. Nothing tells them why you."],
      ["Maintenance plans don't sell themselves", "Your best recurring revenue is buried at the bottom of a services page."],
    ],
    solutions: [
      ["A call button that never hides", "Big tap-to-call on every page, plus a short request form for after hours.", ["Text alert for every web request", "Emergency message at the top in peak season", "Call tracking so you know what's working"]],
      ["Pages for every service and town", "AC repair, installs, heat pumps and maintenance, each with its own page for the towns you cover."],
      ["Maintenance plans up front", "A clear plan page with what's included and a simple sign-up, so slow months fill themselves."],
      ["Reviews where they decide", "A Google Business Profile that's filled out, and a simple text to ask happy customers for a review."],
    ],
    faqs: [
      ["Will this get me more calls in the busy season?", "It makes sure you get your share of the calls that are already happening. Fast pages, a call button that never hides and a strong Google listing mean the people searching reach you before the next company."],
      ["Can it help in the slow season?", "Yes. That's what maintenance plan pages and tune-up specials are for. They give people a reason to call before anything breaks."],
      PRICE_FAQ,
    ],
  },

  plumbing: {
    headline: "When a pipe bursts, be the plumber they reach first",
    intro:
      "Nobody shops around with water on the floor. They call the first plumber who looks legit and answers. I build plumbing sites that load fast, look trustworthy and put your number under their thumb.",
    stats: ["speed", "silent", "reviews"],
    problems: [
      ["Your site is slow on a phone", "Someone standing in an inch of water won't wait for a page to load."],
      ["You can't tell which ads work", "You pay for ads and directories, but you don't know which ones actually make the phone ring."],
      ["Directories send your leads to everyone", "Lead sites sell the same job to three plumbers and you race to the bottom on price."],
    ],
    solutions: [
      ["Fast, call-first pages", "Your number at the top of every page, and pages that load in a blink on a bad signal."],
      ["A page for every job you want more of", "Water heaters, drain cleaning, repipes, each with its own page for your towns."],
      ["Know where every call came from", "Simple tracking that shows which calls came from Google, ads or your truck wrap, in plain English.", ["Call and form tracking", "Monthly report you can read in two minutes"]],
    ],
    faqs: [
      ["Do I still need to pay for lead sites?", "Maybe less. Every call that comes straight from your own site and Google listing is one you don't share with three competitors."],
      ["How fast will the site be?", "Fast. I build for phones on a weak signal first, because that's how your customers find you in an emergency."],
      PRICE_FAQ,
    ],
  },

  roofing: {
    headline: "Win the storm season jobs, and skip the tire kickers",
    intro:
      "After a storm, every homeowner on the street is searching at once, and so are the storm chasers. I build roofing sites that prove you're local, show real roofs you've done and sort real jobs from people just shopping.",
    stats: ["speed", "silent", "reviews"],
    problems: [
      ["Storm chasers outrank you", "Out-of-town crews with big ad budgets show up first, right when your neighbors need you."],
      ["Quote requests with no details", "You drive out to measure a roof for someone who was never going to buy."],
      ["Insurance questions eat your day", "Homeowners call confused about claims before they ever ask for an inspection."],
    ],
    solutions: [
      ["Proof you're local", "Your address, license, years in business and roofs you've done in their neighborhood."],
      ["A quote form that qualifies", "A few quick questions about roof type, damage and timing, so you know who to call first.", ["Photo upload for damage", "Insurance claim yes or no", "Text alert for every request"]],
      ["Plain English insurance help", "A page that explains how a claim works with you, so people call ready for an inspection."],
    ],
    faqs: [
      ["Can the site handle a flood of requests after a storm?", "Yes. The pages stay fast under traffic, and every request texts you with the details, so you can sort them by urgency from the truck."],
      UPDATE_FAQ,
      PRICE_FAQ,
    ],
  },

  "cleaning-services": {
    headline: "Fill the week with recurring clients, not phone tag",
    intro:
      "Your best clients are the ones who book every two weeks for years. I build cleaning sites that make booking easy, show what's included and turn first-time cleans into regulars.",
    stats: ["speed", "silent", "reviews"],
    problems: [
      ["Phone tag for every booking", "You're on a job, they call, you call back, they're at work. The booking goes to whoever answered."],
      ["Price is a mystery", "People don't know what a clean costs or what's included, so they compare you on price alone."],
      ["One-time cleans never come back", "There's no easy way for a happy customer to set up a recurring schedule."],
    ],
    solutions: [
      ["Online booking that fits your schedule", "Customers pick a time you actually have open, and you get a text.", ["Booking form or calendar", "Text alert for every booking", "Reminder before each visit"]],
      ["Clear checklists and starting prices", "Exactly what a standard, deep and move-out clean includes, with starting prices."],
      ["A reason to go recurring", "Show the savings for weekly or biweekly plans right on the booking page."],
    ],
    faqs: [
      ["Can customers book online without calling?", "Yes, and most would rather. You stay in control of which days and times are open."],
      UPDATE_FAQ,
      PRICE_FAQ,
    ],
  },

  "landscaping-and-lawn-care": {
    headline: "Win the neighborhoods you actually want to drive to",
    intro:
      "A tight route is a profitable route. I build landscaping sites with a page for each area you serve, so you show up in the neighborhoods you want and stop driving across town for one small yard.",
    stats: ["speed", "silent", "reviews"],
    problems: [
      ["Leads from all over the map", "Requests come in from 40 minutes away and you either say no or lose money on the drive."],
      ["Spring is chaos, winter is quiet", "Everyone wants you in April, then the phone goes silent."],
      ["Design work looks like mowing", "Your hardscapes and installs get lumped in with weekly mowing, so nobody knows you do them."],
    ],
    solutions: [
      ["A page for every area you serve", "Pages built for the towns and neighborhoods on your route, so that's where the calls come from."],
      ["Separate pages for big jobs", "Patios, installs and design projects with their own galleries and quote form.", ["Before and after gallery", "Quote form with photo upload", "Text alert for every request"]],
      ["Year-round offers", "Fall cleanups, holiday lighting or maintenance plans up front, so winter isn't dead."],
    ],
    faqs: [
      ["Can I stop getting requests from areas I don't serve?", "Mostly, yes. Clear service area pages and a zip code question on the form keep the far-away requests down."],
      UPDATE_FAQ,
      PRICE_FAQ,
    ],
  },

  "retail-shops": {
    headline: "Turn people browsing on their phone into people in your shop",
    intro:
      "Before they drive over, shoppers check if you're open, where to park and if you have what they want. I build simple shop sites that answer all three and keep your Google listing in step.",
    stats: ["reviews", "silent"],
    problems: [
      ["People don't know what you carry", "They assume you don't have it and drive to the big box store."],
      ["Hours and holiday hours are out of date", "One wrong Sunday and a customer stops trusting your listing."],
      ["Events and sales get missed", "Your sidewalk sale lives on a poster in the window."],
    ],
    solutions: [
      ["Show what's on the shelves", "Featured products and categories with photos, easy to update from your phone."],
      ["Hours, directions and parking, in one tap", "Right at the top, matched to your Google listing."],
      ["Events and specials that reach people", "A simple spot for sales and events, plus an email signup for regulars.", ["Email signup", "Event and sale banners", "Google posts for each event"]],
    ],
    faqs: [
      ["Do I need online ordering?", "Not always. Many shops do better showing what's in stock and getting people through the door. We'll talk about which one fits your shop."],
      UPDATE_FAQ,
      PRICE_FAQ,
    ],
  },
};
