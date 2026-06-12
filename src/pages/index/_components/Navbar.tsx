import {
  AlarmClock,
  Accessibility,
  CircleHelp,
  ListChecks,
  Menu,
  PlayCircle,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Problema",
      href: "#problema",
      Icon: CircleHelp,
    },
    {
      label: "Cómo funciona",
      href: "#como-funciona",
      Icon: PlayCircle,
    },
    {
      label: "Características",
      href: "#caracteristicas",
      Icon: Sparkles,
    },
    {
      label: "Accesibilidad",
      href: "#accesibilidad",
      Icon: Accessibility,
    },
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md">
            <AlarmClock
              className="h-5 w-5 text-primary-foreground"
              strokeWidth={2.5}
            />
          </div>

          <span className="text-xl font-black tracking-tight text-foreground">
            TockTock<span className="text-primary">Alarm</span>
          </span>
        </a>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map(({ label, href, Icon }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/app">
            <Button size="sm" className="gap-2 font-semibold">
              <ListChecks className="h-4 w-4" />
              Abrir App
            </Button>
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-foreground md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <div className="flex flex-col gap-2 px-4 py-4">
              {links.map(({ label, href, Icon }) => (
                <a
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-base font-bold text-foreground"
                  onClick={() => setOpen(false)}
                >
                  <Icon className="h-5 w-5 text-primary" />
                  {label}
                </a>
              ))}

              <Link to="/app" onClick={() => setOpen(false)}>
                <Button className="mt-2 w-full gap-2 font-semibold">
                  <ListChecks className="h-4 w-4" />
                  Abrir App
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}