import { AlarmClock, ArrowRight, Moon, Sun, Sunset } from "lucide-react";
import { motion } from "motion/react";

const steps = [
  {
    step: "01",
    title: "Elige tu turno activo",
    desc: "Selecciona el turno que te corresponde esta semana: Mañana, Tarde o Noche. Un solo toque.",
    color: "text-amber-500",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    icon: Sun,
  },
  {
    step: "02",
    title: "Tus alarmas se activan solas",
    desc: "Todas las alarmas configuradas para ese turno se activan automáticamente. Sin configurar una por una.",
    color: "text-primary",
    bg: "bg-primary/10",
    icon: AlarmClock,
  },
  {
    step: "03",
    title: "Al cambiar de turno",
    desc: "Desactiva el turno anterior y activa el nuevo. Todas las alarmas cambian juntas instantáneamente.",
    color: "text-indigo-500",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    icon: Moon,
  },
];

const shifts = [
  {
    label: "Turno Mañana",
    icon: Sun,
    color: "text-amber-600",
    bg: "bg-amber-500",
    time: "05:30 — 13:30",
    alarms: ["05:00 — Despertar", "05:20 — Prepararse", "06:00 — Salir"],
    pattern: "bg-amber-500",
    active: true,
  },
  {
    label: "Turno Tarde",
    icon: Sunset,
    color: "text-orange-600",
    bg: "bg-orange-500",
    time: "13:30 — 21:30",
    alarms: ["12:30 — Despertar", "13:00 — Prepararse", "13:15 — Salir"],
    pattern: "bg-orange-500",
    active: false,
  },
  {
    label: "Turno Noche",
    icon: Moon,
    color: "text-indigo-600",
    bg: "bg-indigo-500",
    time: "21:30 — 05:30",
    alarms: ["20:00 — Despertar", "20:30 — Prepararse", "21:00 — Salir"],
    pattern: "bg-indigo-500",
    active: false,
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-full px-4 py-2 text-sm font-semibold mb-6">
            <AlarmClock className="w-4 h-4" />
            Así de sencillo
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-balance mb-4">
            ¿Cómo funciona <span className="text-primary">TockTockAlarm</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            En tres simples pasos, tus alarmas siempre estarán listas para tu próximo turno.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative"
            >
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-full">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                    <s.icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-muted-foreground tracking-widest uppercase">
                      Paso {s.step}
                    </span>
                    <h3 className="font-bold text-lg mt-1 mb-2">{s.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Shift preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <p className="text-muted-foreground font-medium text-sm uppercase tracking-widest">
              Vista previa de la app
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-xl">Mis Turnos</h3>
                <p className="text-muted-foreground text-sm">Semana actual</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <AlarmClock className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {shifts.map((shift) => (
                <div
                  key={shift.label}
                  className={`rounded-2xl p-5 border-2 transition-all ${
                    shift.active
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${shift.active ? shift.bg : "bg-muted"} flex items-center justify-center`}>
                      <shift.icon className={`w-5 h-5 ${shift.active ? "text-white" : "text-muted-foreground"}`} />
                    </div>
                    {shift.active && (
                      <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-1 rounded-full">
                        ACTIVO
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-sm mb-1">{shift.label}</p>
                  <p className="text-xs text-muted-foreground mb-3">{shift.time}</p>
                  <div className="space-y-1.5">
                    {shift.alarms.map((alarm) => (
                      <div
                        key={alarm}
                        className={`text-xs rounded-lg px-3 py-2 font-mono font-medium ${
                          shift.active
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {alarm}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
