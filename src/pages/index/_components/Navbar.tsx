import { AlarmClock, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Problema", href: "#problema" },
    { label: "Cómo funciona", href: "#como-funciona" },
    { label: "Características", href: "#caracteristicas" },
    { label: "Accesibilidad", href: "#accesibilidad" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <AlarmClock className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-black text-xl tracking-tight text-foreground">
            TockTock<span className="text-primary">Alarm</span>
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/app">
            <Button size="sm" className="font-semibold">
              Abrir App
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border bg-background"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-base font-medium text-foreground py-2 border-b border-border last:border-0"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              ))}
              <Link to="/app" onClick={() => setOpen(false)}>
                <Button className="w-full font-semibold mt-2">Abrir App</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
