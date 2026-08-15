'use client';

import { motion } from 'framer-motion';
import { Home, Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          className="mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <span className="text-9xl font-display font-bold text-primary-500/20">404</span>
        </motion.div>
        
        <motion.h1
          className="text-4xl md:text-5xl font-display font-bold text-dark-900 dark:text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Page Not Found
        </motion.h1>
        
        <motion.p
          className="text-lg text-muted-foreground mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </motion.p>
        
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button size="lg" asChild>
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/#features">
              <Search className="w-5 h-5 mr-2" />
              Explore Features
            </Link>
          </Button>
        </motion.div>
        
        <motion.div
          className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <a href="#" className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <RotateCcw className="w-4 h-4" />
            Refresh Page
          </a>
          <span>or</span>
          <a href="#" className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            Contact Support
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}