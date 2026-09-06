"use client";

import { motion } from "framer-motion";

export default function WhySutrixa() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              BUILT FOR <span className="text-accent">THE FUTURE</span>
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted">
              <p>
                SUTRIXA AI was created with a single vision: to bridge the gap
                between premium design and accessible development resources. We
                believe every developer and business deserves access to
                beautifully crafted website templates.
              </p>
              <p>
                Our team combines years of design and engineering expertise to
                produce templates that are not just visually stunning, but also
                built with clean, maintainable code. Every template is crafted
                using modern technologies like Next.js, React, TypeScript, and
                Tailwind CSS.
              </p>
              <p>
                We are committed to continuously expanding our collection with
                fresh designs that reflect the latest trends in web development,
                ensuring you always have access to cutting-edge resources.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative h-[400px] w-full max-w-md">
              <svg
                viewBox="0 0 400 400"
                fill="none"
                className="absolute inset-0 h-full w-full"
              >
                <rect
                  x="60"
                  y="60"
                  width="280"
                  height="280"
                  rx="20"
                  stroke="#00d4ff"
                  strokeWidth="1"
                  opacity="0.15"
                />
                <rect
                  x="100"
                  y="100"
                  width="200"
                  height="200"
                  rx="12"
                  stroke="#00d4ff"
                  strokeWidth="1"
                  opacity="0.2"
                />
                <rect
                  x="140"
                  y="140"
                  width="120"
                  height="120"
                  rx="8"
                  stroke="#00d4ff"
                  strokeWidth="1.5"
                  opacity="0.3"
                />
                <line
                  x1="60"
                  y1="60"
                  x2="100"
                  y2="100"
                  stroke="#00d4ff"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
                <line
                  x1="340"
                  y1="60"
                  x2="300"
                  y2="100"
                  stroke="#00d4ff"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
                <line
                  x1="60"
                  y1="340"
                  x2="100"
                  y2="300"
                  stroke="#00d4ff"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
                <line
                  x1="340"
                  y1="340"
                  x2="300"
                  y2="300"
                  stroke="#00d4ff"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
                <circle cx="200" cy="200" r="4" fill="#00d4ff" opacity="0.8" />
                <circle cx="60" cy="60" r="3" fill="#00d4ff" opacity="0.5" />
                <circle cx="340" cy="60" r="3" fill="#00d4ff" opacity="0.5" />
                <circle cx="60" cy="340" r="3" fill="#00d4ff" opacity="0.5" />
                <circle cx="340" cy="340" r="3" fill="#00d4ff" opacity="0.5" />
                <circle cx="200" cy="200" r="80" stroke="#00d4ff" strokeWidth="0.5" opacity="0.1" strokeDasharray="4 6" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
