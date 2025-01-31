export const siteConfig = {
  name: "Playwright Bot",
  url: "https://playwright-bot-phi.vercel.app/",
  ogImage: "https://playwright-bot-phi.vercel.app/og.jpg",
  description:
    "Automate, Analyze, Accelerate with Playwright BOT - Unleash the power of intelligent web automation for scraping, testing, and data analysis",
  links: {
    twitter: "https://twitter.com/playwrightbot",
    github: "https://github.com/yourusername/playwright-bot",
  },
}

export type SiteConfig = typeof siteConfig

export const routes = [
  {
    path: "/",
    name: "Home",
  },
  {
    path: "/about",
    name: "About",
  },
  {
    path: "/contact",
    name: "Contact",
  },
  {
    path: "/company",
    name: "Company",
  },
  {
    path: "/product",
    name: "Product",
  },
  {
    path: "/settings",
    name: "Settings",
  },
]
