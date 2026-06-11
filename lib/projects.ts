export type Theme = "web" | "mobile" | "ml-ai" | "backend" | "tools" | "early";

export interface Project {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  themes: Theme[];
  year: number;
  tech: string[];
  github?: string;
  cover: string;
  rank: number;
}

export const THEMES: { id: Theme; label: string }[] = [
  { id: "web", label: "Web" },
  { id: "mobile", label: "Mobile" },
  { id: "ml-ai", label: "ML / AI" },
  { id: "backend", label: "Backend" },
  { id: "tools", label: "Tools" },
  { id: "early", label: "Early Work" },
];

export const projects: Project[] = [
  {
    slug: "quillin",
    title: "Quillin'",
    subtitle: "Handwritten notes to LaTeX at 95% accuracy",
    description:
      "An OCR pipeline that turns handwritten notes — including mathematical notation — into clean LaTeX markdown. FastAPI backend combines Google Vision and MathPix for recognition, with Llama (Groq) generating clarifying questions and tailored explanations. Built and demoed at a hackathon, used by 10+ people including the judges.",
    themes: ["ml-ai", "backend"],
    year: 2024,
    tech: ["Swift", "FastAPI", "Google Vision API", "MathPix", "Llama (Groq)"],
    github: "https://github.com/Quillin-Writing-App/backend",
    cover: "/covers/quillin.jpg",
    rank: 1,
  },
  {
    slug: "pricelessedu",
    title: "PricelessEdu",
    subtitle: "LMS serving 3,000+ active users at 99.9% uptime",
    description:
      "A custom ASP.NET learning management system deployed on AWS EC2, drawing 800+ monthly sign-ups. Advanced search, filtering, and review workflows cut application processing time by 60%, and disciplined maintenance kept the system at 99.9% uptime for over 3,000 active users.",
    themes: ["web", "backend"],
    year: 2022,
    tech: ["C#", "ASP.NET", "Entity Framework", "MongoDB", "AWS EC2"],
    github: "https://github.com/Xeryto/Priceless",
    cover: "/covers/pricelessedu.jpg",
    rank: 2,
  },
  {
    slug: "polkamono",
    title: "PolkaMono",
    subtitle: "Fashion platform — mobile, web, and API",
    description:
      "A fashion app monorepo: React Native mobile client, React web frontend, and a Python ASGI backend, all sharing one type-safe contract. Currently gearing up for release.",
    themes: ["mobile", "web", "backend"],
    year: 2025,
    tech: ["TypeScript", "React Native", "React", "Python", "FastAPI"],
    github: "https://github.com/Xeryto/PolkaMono",
    cover: "/covers/polkamono.jpg",
    rank: 3,
  },
  {
    slug: "subitup-extension",
    title: "SubItUp Sync",
    subtitle: "Chrome extension syncing work shifts to calendars",
    description:
      "A Chrome extension that pulls work shifts from SubItUp and syncs them to Google Calendar or Apple Calendar via CalDAV. OAuth2 identity, background sync, and a privacy-first design — live on the Chrome Web Store.",
    themes: ["tools", "web"],
    year: 2026,
    tech: ["TypeScript", "Chrome APIs", "OAuth2", "CalDAV"],
    github: "https://github.com/Xeryto/subitupExtension",
    cover: "/covers/subitup-extension.jpg",
    rank: 4,
  },
  {
    slug: "mailchimp-ci-triage",
    title: "CI/CD Quality Gate Triage",
    subtitle: "Dockerized Go CLI — 61% faster incident detection",
    description:
      "Built at Intuit Mailchimp: a Dockerized Go CLI that automatically triages Playwright quality-gate failures by re-running failed tests against prod with isolated, updated feature flags. Cut mean time to detect production incidents by 61% and is used in 100% of E2E quality gate incidents.",
    themes: ["tools", "backend"],
    year: 2025,
    tech: ["Go", "Docker", "Playwright", "Jenkins", "AWS"],
    cover: "/covers/mailchimp-ci-triage.jpg",
    rank: 5,
  },
  {
    slug: "anomalies-detector",
    title: "Anomalies Detector",
    subtitle: "Clustering correct vs. incorrect exercise form",
    description:
      "An ML model from my Resola internship that clusters correct and incorrect executions of physical exercises from body sensor data. Analysis across four workout sessions improved predictive accuracy by 30%, powering real-time feedback for 200+ patients.",
    themes: ["ml-ai"],
    year: 2022,
    tech: ["Python", "NumPy", "Pandas", "Scikit-Learn", "Jupyter"],
    github: "https://github.com/Xeryto/anomaliesDetector",
    cover: "/covers/anomalies-detector.jpg",
    rank: 6,
  },
  {
    slug: "node-rest-api",
    title: "Node REST API",
    subtitle: "Express + MongoDB API deployed on EC2",
    description:
      "A NodeJS Express RESTful API with user authentication and authorization, MongoDB persistence, and a grab-bag of endpoints — hottest stocks, country facts, dog picture of the day. Deployed globally on AWS EC2.",
    themes: ["backend"],
    year: 2024,
    tech: ["Node.js", "Express", "MongoDB", "JWT", "AWS EC2"],
    github: "https://github.com/Xeryto/node-rest-api",
    cover: "/covers/node-rest-api.jpg",
    rank: 7,
  },
  {
    slug: "smart-sprinkler",
    title: "SmartSprinkler",
    subtitle: "Computer-vision sprinkler that finds people",
    description:
      "A hardware + software project: an Arduino-driven sprinkler guided by a TensorFlow person-detection model. Python handles tracking and window search; the firmware aims the spray.",
    themes: ["ml-ai", "tools"],
    year: 2022,
    tech: ["Python", "TensorFlow", "Arduino", "OpenCV"],
    github: "https://github.com/Xeryto/SmartSprinkler",
    cover: "/covers/smart-sprinkler.jpg",
    rank: 8,
  },
  {
    slug: "ibiblee-telebot",
    title: "ibiblee",
    subtitle: "Telegram bot with SQL-backed state",
    description:
      "A Python Telegram bot with a SQL-backed datastore, deployed via Procfile-style hosting with a Vercel-hosted landing. An early exercise in webhooks, persistence, and shipping something people could actually message.",
    themes: ["tools", "backend"],
    year: 2022,
    tech: ["Python", "Telegram Bot API", "SQL"],
    github: "https://github.com/Xeryto/ibiblee-telebot",
    cover: "/covers/ibiblee-telebot.jpg",
    rank: 9,
  },
  {
    slug: "dunno",
    title: "Dunno",
    subtitle: "ASP.NET MVC notes & news app",
    description:
      "An ASP.NET MVC application with books, news, and notes modules backed by Entity Framework migrations — an early deep-dive into the C# web stack that later paid off in PricelessEdu.",
    themes: ["web", "backend"],
    year: 2022,
    tech: ["C#", "ASP.NET MVC", "Entity Framework", "SQL Server"],
    github: "https://github.com/Xeryto/Dunno",
    cover: "/covers/dunno.jpg",
    rank: 10,
  },
  {
    slug: "meeting-rooms-service",
    title: "Meeting Rooms Service",
    subtitle: "Layered C# reservation service with tests",
    description:
      "A meeting-room reservation service written in C# with a clean layered architecture — business logic, generic repository DAL, and a unit-test project. Paired with a client app for booking flows.",
    themes: ["backend"],
    year: 2021,
    tech: ["C#", ".NET", "Generic Repository", "Unit Testing"],
    github: "https://github.com/Xeryto/MeetingRoomsService",
    cover: "/covers/meeting-rooms-service.jpg",
    rank: 11,
  },
  {
    slug: "coding-challenge",
    title: "Coding Challenge",
    subtitle: "Django app built against the clock",
    description:
      "A Django project built for a timed coding challenge — ASGI setup, admin, and static pipeline stood up quickly under pressure.",
    themes: ["backend", "early"],
    year: 2023,
    tech: ["Python", "Django"],
    github: "https://github.com/Xeryto/codingChallenge",
    cover: "/covers/coding-challenge.jpg",
    rank: 12,
  },
  {
    slug: "lifegame",
    title: "lifeGame",
    subtitle: "Conway's Game of Life in Python",
    description:
      "A from-scratch implementation of Conway's Game of Life — cellular automata, neighbor counting, and emergent behavior in a single Python file.",
    themes: ["early"],
    year: 2021,
    tech: ["Python"],
    github: "https://github.com/Xeryto/lifeGame",
    cover: "/covers/lifegame.jpg",
    rank: 13,
  },
  {
    slug: "letovo-forest",
    title: "LetovoForest",
    subtitle: "Android app built in high school",
    description:
      "A native Android app built in Java with Gradle — one of my first encounters with mobile development, activity lifecycles, and shipping to a real device.",
    themes: ["mobile", "early"],
    year: 2021,
    tech: ["Java", "Android SDK", "Gradle"],
    github: "https://github.com/Xeryto/LetovoForest",
    cover: "/covers/letovo-forest.jpg",
    rank: 14,
  },
  {
    slug: "atlas",
    title: "atlas",
    subtitle: "Multi-page PHP site, hand-rolled CSS",
    description:
      "A multi-page PHP website with hand-written CSS and image galleries — early lessons in structuring pages, partials, and styling without a framework.",
    themes: ["web", "early"],
    year: 2021,
    tech: ["PHP", "HTML/CSS"],
    github: "https://github.com/Xeryto/atlas",
    cover: "/covers/atlas.jpg",
    rank: 15,
  },
  {
    slug: "ocfp",
    title: "ocfp",
    subtitle: "Imaginary clothes store, real HTML",
    description:
      "A website for an imaginary clothing store — my first complete multi-page site, built with plain HTML and CSS in 2020.",
    themes: ["web", "early"],
    year: 2020,
    tech: ["HTML", "CSS"],
    github: "https://github.com/Xeryto/ocfp",
    cover: "/covers/ocfp.jpg",
    rank: 16,
  },
  {
    slug: "geometry-topics",
    title: "geometryTopics",
    subtitle: "Collaborative PHP geometry explainers",
    description:
      "A collaborative set of PHP pages explaining geometry topics, complete with a GitHub Actions CI workflow — an early experiment in working on code with other people.",
    themes: ["web", "early"],
    year: 2020,
    tech: ["PHP", "GitHub Actions"],
    github: "https://github.com/Xeryto/geometryTopics",
    cover: "/covers/geometry-topics.jpg",
    rank: 17,
  },
  {
    slug: "juva",
    title: "juva",
    subtitle: "First steps in Java",
    description:
      "Java fundamentals — classes, objects, and the obligatory Bicycle example. Where the whole thing started.",
    themes: ["early"],
    year: 2020,
    tech: ["Java"],
    github: "https://github.com/Xeryto/juva",
    cover: "/covers/juva.jpg",
    rank: 18,
  },
];
