'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Shield, CheckCircle2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { landingFeatures } from '@/lib/constants';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-32 md:py-48">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Shield className="size-4" />
              Secure payments powered by AI
            </div>
            <h1 className="mt-8 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Pay with Confidence on <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                Solana Devnet
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              SafeSpend AI intercepts transactions, analyzes for malicious intent,
              and forces policy compliance before the transaction hits the blockchain.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
                Open Dashboard <ArrowRight className="size-4" />
              </Link>
              <Link href="#architecture" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "gap-2")}>
                How it Works
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="border-t border-border/50 bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Platform Features</h2>
            <p className="mt-4 text-muted-foreground">Comprehensive protection for every transaction.</p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {landingFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ARCHITECTURE SECTION */}
      <section id="architecture" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it Works</h2>
            <p className="mt-4 text-muted-foreground">Every transaction passes through our rigorous AI validation pipeline.</p>
          </div>

          <div className="mt-20 flex flex-col items-center gap-8 md:flex-row md:justify-center md:gap-12">
            {[
              { icon: Shield, title: "1. Intent", desc: "User initiates transaction" },
              { icon: Bot, title: "2. Analysis", desc: "AI engine scans for risks" },
              { icon: CheckCircle2, title: "3. Execution", desc: "Signed & sent to Solana" }
            ].map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="flex w-64 flex-col items-center text-center relative"
              >
                <div className="mb-4 flex size-20 items-center justify-center rounded-full border-4 border-background bg-muted shadow-xl z-10 text-foreground">
                  <step.icon className="size-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
                {/* Arrow connecting nodes, hidden on last item and mobile */}
                {idx !== 2 && (
                  <div className="hidden absolute top-10 left-[60%] w-full h-[2px] bg-border md:block -z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
