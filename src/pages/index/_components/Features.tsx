import {
  AlarmClock, Bell, Eye, Layers, RefreshCw, Smartphone, Star, Type, Users, Zap,
} from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Layers,
    title: "Alarmas por turno",
    desc: "Crea grupos de alarmas para cada turno. Activa el grupo correcto y todas las alarmas se ajustan solas.",
    color: "text-primary",
    bg: "bg-primary/10",
    badge: "Core",
  },
  {
    icon: RefreshCw,
    title: "Cambio de turno en 1 toque",
    desc: "Pasas de Turno Mañana a Turno Noche con un solo toque. Sin reconfigurar nada manualmente.",
    color: "text-teal-600",
    bg: "bg-teal-100 dark:bg-teal-900/30",
    badge: "",
  },
  {
    icon: Bell,
    title: "Notificaciones de alarma",
    desc: "Recibe alertas sonoras y visuales a tiempo. Funciona incluso con la pantalla apagada.",
    color: "text-orange-500",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    badge: "",
  },
  {
    icon: Eye,
    title: "Modo daltonismo",
    desc: "Paleta de colores diseñada para personas con daltonismo. Íconos grandes y contrastados.",
    color: "text-purple-600",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    badge: "Inclusivo",
  },
  {
    icon: Type,
    title: "Texto grande",
    desc: "Fuentes de gran tamaño pensadas para adultos mayores y personas con visión reducida.",
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    badge: "Accesible",
  },
  {
    icon: Smartphone,
    title: "Instalable en celular",
    desc: "Instala TockTockAlarm directo en tu pantalla de inicio, como una app nativa. Sin tienda de apps.",
    color: "text-green-600",
    bg: "bg-green-100 dark:bg-green-900/30",
    badge: "PWA",
  },
  {
    icon: Zap,
    title: "Ultra rápida",
    desc: "Carga instantánea, sin publicidad, sin distracciones. Solo lo que necesitas para no llegar tarde.",
    color: "text-yellow-600",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    badge: "",
  },
  {
    icon: Users,
    title: "Para cada trabajador",
    desc: "Cada colaborador tiene su propia cuenta con sus turnos y alarmas personales guardadas.",
    color: "text-indigo-600",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    badge: "",
  },
  {
    icon: AlarmClock,
    title: "Múltiples alarmas por turno",
    desc: "Configura alarmas para despertar, prepararse y salir. Todo dentro del mismo grupo de turno.",
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900/30",
    badge: "",
  },
];

export default function Features() {
  return (
    <section id="caracteristicas" className="py-24 bg-muted/20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-full px-4 py-2 text-sm font-semibold mb-6">
            <Star className="w-4 h-4" />
            Funcionalidades
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-balance mb-4">
            Todo lo que necesitas,
            <br />
            <span className="text-primary">nada de lo que no</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Una app enfocada 100% en resolver el problema de los turnos rotativos y la puntualidad.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center flex-shrink-0`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-sm">{f.title}</h3>
                    {f.badge && (
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full flex-shrink-0">
                        {f.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
