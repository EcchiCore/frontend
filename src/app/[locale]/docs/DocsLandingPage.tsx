"use client";

import Link from "next/link";
import { Book, FileText, Settings, HelpCircle, ChevronRight, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
}

const docSections: DocSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics and get started with Chanomhub quickly",
    icon: <Book className="w-6 h-6" />,
    href: "/docs/getting-started",
    badge: "Recommended",
  },
  {
    id: "installation",
    title: "Installation",
    description: "Step-by-step guide to setting up your project locally",
    icon: <FileText className="w-6 h-6" />,
    href: "/docs/installation",
  },
  {
    id: "advanced-features",
    title: "Advanced Features",
    description: "Explore advanced features and customization options for maximum efficiency",
    icon: <Settings className="w-6 h-6" />,
    href: "/docs/advanced-features",
  },
  {
    id: "faq",
    title: "FAQ",
    description: "Answers to common questions and basic troubleshooting",
    icon: <HelpCircle className="w-6 h-6" />,
    href: "/docs/faq",
  },
];

export default function DocsLandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark bg-gray-900" : "bg-gradient-to-br from-gray-100 to-blue-100"} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Dark Mode Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-6">
            <Book className="w-4 h-4 mr-2" />
            Documentation
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to
            <span className="text-blue-600 dark:text-blue-400 block mt-2">Chanomhub Docs</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Comprehensive guides for using Chanomhub, a tool designed to help you work efficiently, with clear examples and instructions.
          </p>
        </motion.div>

        {/* Quick Start Button */}
        <div className="text-center mb-16">
          <Link href="/docs/getting-started">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
              <ChevronRight className="w-5 h-5 ml-2" />
            </motion.button>
          </Link>
        </div>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {docSections.map((section, index) => (
            <Link key={section.id} href={section.href} className="group block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-8 h-full border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg group-hover:bg-blue-600 dark:group-hover:bg-blue-700 group-hover:text-white dark:group-hover:text-white transition-colors duration-200"
                    >
                      {section.icon}
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {section.title}
                      </h3>
                      {section.badge && (
                        <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs font-medium rounded-full mt-1">
                          {section.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {section.description}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Features Overview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-100 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Key Features of Chanomhub</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Book className="w-6 h-6" />, title: "Easy to Use", desc: "User-friendly interface designed for simplicity", color: "green" },
              { icon: <Settings className="w-6 h-6" />, title: "Customizable", desc: "Flexible customization to fit your needs", color: "purple" },
              { icon: <ChevronRight className="w-6 h-6" />, title: "High Performance", desc: "Fast and reliable performance", color: "orange" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="text-center p-4"
              >
                <div className={`w-12 h-12 bg-${feature.color}-100 dark:bg-${feature.color}-900 text-${feature.color}-600 dark:text-${feature.color}-300 rounded-lg mx-auto mb-4 flex items-center justify-center`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            Need more help? Contact our support team at{" "}
            <a href="mailto:support@chanomhub.com" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              support@chanomhub.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}