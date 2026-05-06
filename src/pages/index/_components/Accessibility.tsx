import { Eye, Type, Volume2, Zap } from "lucide-react";
import { motion } from "motion/react";

const a11yFeatures = [
  {
    icon: Eye,
    title: "Modo daltonismo",
    desc: "Los colores de los turnos (Mañana, Tarde, Noche) usan combinaciones seguras para personas con daltonismo rojo-verde, azul-amarillo y total.",
    detail: "Paleta WCAG AA / AAA",
    preview: (
      <div className="flex gap-2 mt-3">
        <div className="h-8 flex-1 rounded-lg bg-amber-500 flex items-center justify-center text-white text-xs font-bold">AM</div>
        <div className="h-8 flex-1 rounded-lg bg-teal-500 flex items-center justify-center text-white text-xs font-bold">PM</div>
        <div className="h-8 flex-1 rounded-lg bg-indigo-700 flex items-center justify-center text-white text-xs font-bold">NOC</div>
      </div>
    ),
  },
  {
    icon: Type,
    title: "Texto grande",
    desc: "Tamaño mínimo de fuente 18px para todos los elementos interactivos. Ideal para adultos mayores y personas con visión reducida.",
    detail: "Mínimo 18px (WCAG 2.1)",
    preview: (
      <div className="mt-3 bg-muted rounded-xl p-3">
        <p className="text-2xl font-black text-foreground">06:00</p>
        <p className="text-base text-muted-foreground font-medium">Salir al trabajo</p>
      </div>
    ),
  },
  {
    icon: Volume2,
    title: "Alarmas sonoras + vibración",
    desc: "Alarmas con sonido fuerte y vibración simultánea para personas con discapacidad auditiva parcial o que duermen profundo.",
    detail: "Sonido + Vibración",
    preview: (
      <div className="mt-3 flex gap-3">
        <div className="flex-1 bg-primary/10 rounded-xl p-3 text-center">
          <Volume2 className="w-6 h-6 text-primary mx-auto mb-1" />
          <p className="text-xs font-semibold text-primary">Sonido</p>
        </div>
        <div className="flex-1 bg-muted rounded-xl p-3 text-center">
          <Zap className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs font-semibold text-muted-foreground">Vibración</p>
        </div>
      </div>
    ),
  },
  {
    icon: Zap,
    title: "Interfaz simplificada",
    desc: "Sin menús complejos. Pantalla principal muestra solo los 3 turnos con íconos grandes. Diseño pensado para el uso rápido antes de dormir.",
    detail: "Máx. 2 toques para cualquier acción",
    preview: (
      <div className="mt-3 grid grid-cols-3 gap-2">
        {["Sol", "Atardecer", "Luna"].map((t, i) => (
          <div key={t} className={`rounded-xl p-2 text-center ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            <p className="text-xs font-bold">{t}</p>
          </div>
        ))}
      </div>
    ),
  },
];

export default function Accessibility() {
  return (
    <section id="accesibilidad" className="py-24">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 rounded-full px-4 py-2 text-sm font-semibold mb-6">
            <Eye className="w-4 h-4" />
            Diseño inclusivo
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-balance mb-4">
            Accesible para <span className="text-primary">todos</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            TockTockAlarm está diseñada para que cualquier trabajador pueda usarla, sin importar
            su edad o condición visual.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {a11yFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base">{f.title}</h3>
                  <span className="text-[11px] text-muted-foreground font-mono">{f.detail}</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              {f.preview}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
