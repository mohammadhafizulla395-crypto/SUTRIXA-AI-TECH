"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What do I receive?",
    answer:
      "You receive the complete source code and all assets needed to run the website. This includes all HTML, CSS, JavaScript, configuration files, and any static assets.",
  },
  {
    question: "Can I customize the website?",
    answer:
      "Yes. All templates are built with clean, well-documented code. You can modify colors, layouts, content, and functionality to match your brand and requirements.",
  },
  {
    question: "What technologies are used?",
    answer:
      "We use modern technologies like Next.js, React, TypeScript, and Tailwind CSS. Each product page lists the specific technologies used for that template.",
  },
  {
    question: "Do I get the source code?",
    answer:
      "Yes. You receive full source code ownership. You can modify, extend, and deploy the code however you need.",
  },
  {
    question: "Can I use the website commercially?",
    answer:
      "Yes. You can use the template for personal or commercial projects. There are no restrictions on commercial usage.",
  },
  {
    question: "How do I purchase a resource?",
    answer:
      "Click 'Get This Resource' on any product page to start the purchase process. Follow the checkout steps to complete your order and gain instant access.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-base font-medium text-foreground pr-4">
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0 text-muted"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-muted">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            FREQUENTLY ASKED{" "}
            <span className="text-accent">QUESTIONS</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Everything you need to know about our products and services.
          </p>
        </div>

        <div className="mt-12 divide-y divide-border rounded-xl border border-border bg-card">
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
