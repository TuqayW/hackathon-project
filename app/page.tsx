"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Target,
  TrendingUp,
  Sparkles,
  Shield,
  Zap,
  PiggyBank,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen mesh-gradient">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">FinMate</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="gradient" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Gamified Budget Planning
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your Financial
              <br />
              <span className="text-gradient">Journey</span> Starts Here
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Plan your path to financial freedom with smart savings goals,
              gamified progress tracking, and AI-powered business analysis.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button variant="gradient" size="xl" className="group">
                  Start Your Path
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="xl">
                  I Already Have an Account
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            className="mt-20 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="relative mx-auto max-w-4xl">
              {/* Decorative elements */}
              <div className="absolute -top-10 -left-10 w-72 h-72 bg-violet-500/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-emerald-500/30 rounded-full blur-3xl" />

              {/* Main card */}
              <div className="relative glass rounded-3xl p-8 shadow-2xl">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Progress Circle */}
                  <div className="flex flex-col items-center justify-center p-6 bg-card rounded-2xl">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          className="fill-none stroke-muted stroke-[8]"
                        />
                        <motion.circle
                          cx="64"
                          cy="64"
                          r="56"
                          className="fill-none stroke-[8]"
                          style={{
                            stroke: "url(#gradient)",
                          }}
                          strokeLinecap="round"
                          initial={{ strokeDasharray: "0 352" }}
                          animate={{ strokeDasharray: "246 352" }}
                          transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                        />
                        <defs>
                          <linearGradient id="gradient">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">70%</span>
                      </div>
                    </div>
                    <p className="mt-4 font-medium">Vacation Fund</p>
                    <p className="text-sm text-muted-foreground">$2,800 / $4,000</p>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-col justify-center gap-4 p-6 bg-card rounded-2xl">
                    <div>
                      <p className="text-sm text-muted-foreground">Daily Save Rate</p>
                      <p className="text-3xl font-bold text-emerald-500">$12</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Days Remaining</p>
                      <p className="text-3xl font-bold">42</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-emerald-500">
                      <TrendingUp className="w-4 h-4" />
                      <span>On track!</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-col justify-center gap-3 p-6 bg-card rounded-2xl">
                    <Button variant="secondary" className="justify-start">
                      <PiggyBank className="w-4 h-4 mr-2" />
                      Add Savings
                    </Button>
                    <Button variant="secondary" className="justify-start">
                      <Target className="w-4 h-4 mr-2" />
                      New Goal
                    </Button>
                    <Button variant="secondary" className="justify-start">
                      <Zap className="w-4 h-4 mr-2" />
                      Log Expense
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="text-gradient">Succeed</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you&apos;re managing personal finances or running a business,
              FinMate has the tools you need.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "Pathfinder Goals",
                description:
                  "Set savings goals and get a daily, weekly, and monthly breakdown of exactly how much to save.",
                color: "from-violet-500 to-violet-600",
              },
              {
                icon: TrendingUp,
                title: "Progress Tracking",
                description:
                  "Beautiful circular progress bars and charts show exactly where you stand on your financial journey.",
                color: "from-emerald-500 to-emerald-600",
              },
              {
                icon: Sparkles,
                title: "AI Business Analysis",
                description:
                  "For business owners: Get AI-powered suggestions on where to cut costs based on efficiency ratings.",
                color: "from-amber-500 to-orange-500",
              },
              {
                icon: Shield,
                title: "Emergency Fund Mode",
                description:
                  "Toggle on the 20% buffer for any goal to build in a safety net automatically.",
                color: "from-sky-500 to-blue-500",
              },
              {
                icon: Zap,
                title: "Quick Add Actions",
                description:
                  "Log variable expenses and extra earnings with just a tap from the dashboard.",
                color: "from-pink-500 to-rose-500",
              },
              {
                icon: PiggyBank,
                title: "Fixed Expense Automation",
                description:
                  "Set it and forget it. Fixed expenses auto-deduct on their scheduled days.",
                color: "from-indigo-500 to-purple-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border card-hover"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="relative p-12 rounded-3xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-emerald-600" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

            {/* Content */}
            <div className="relative text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Your Path?
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                Join thousands of users who are already on their way to
                financial freedom. No credit card required.
              </p>
              <Link href="/register">
                <Button
                  size="xl"
                  className="bg-white text-violet-600 hover:bg-white/90"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">FinMate</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FinMate. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

