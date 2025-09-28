import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between px-4 py-4 lg:px-8">
          <Link href="/" className="text-lg font-semibold">
            Cash Track
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Launch dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="container flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16 text-center lg:px-8 lg:py-24">
        <div className="space-y-4">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            Cash flow, simplified
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Track every dollar with a dashboard you&apos;ll love
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Cash Track keeps your income and expenses organized, so you can make smarter decisions faster.
            Connect accounts, manage budgets, and see trends at a glance.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/login">Get started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard">View dashboard</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
