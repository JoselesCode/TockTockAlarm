import { AlertTriangle, BarChart2, Clock, TrendingDown, Truck, UserX } from "lucide-react";
import { motion } from "motion/react";

const problems = [
  {
    icon: Clock,
    color: "text-destructive",
    bg: "bg-destructive/10",
    title: "Atrasos repetidos",
    desc: "Los análisis de marcaje Kronos revelan llegadas tardías semana a semana, afectando la puntualidad del equipo.",
  },
  {
    icon: TrendingDown,
    color: "text-amber-600",
    bg: "bg-amber-100",
    title: "Baja productividad",
    desc: "Cada minuto de atraso impacta la línea de producción y los objetivos diarios del equipo.",
  },
  {
    icon: UserX,
    color: "text-red-600",
    bg: "bg-red-100",
    title: "Riesgo de despido",
    desc: "Los colaboradores con atrasos reiterados enfrentan medidas disciplinarias y riesgo laboral.",
  },
  {
    icon: Truck,
    color: "text-orange-500",
    bg: "bg-orange-100",
    title: "Horarios de despacho",
    desc: "Los clientes esperan puntualidad en los despachos. Los atrasos rompen la cadena de cumplimiento.",
  },
  {
    icon: BarChart2,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Metas incumplidas",
    desc: "Las métricas de producción no se alcanzan cuando el equipo no está completo a tiempo.",
  },
  {
    icon: AlertTriangle,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    title: "Confusión de turnos",
    desc: "Los turnos rotativos crean confusión: ¿qué alarma configuro esta semana? ¿Mañana o tarde?",
  },
];

export default function Problem() {
  return (
    <section id="problema" className="py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-full px-4 py-2 text-sm font-semibold mb-6">
            <AlertTriangle className="w-4 h-4" />
            El problema detectado
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-balance mb-4">
            Los atrasos cuestan <span className="text-destructive">más</span> de lo que crees
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nestlé y el Sindicato N°1 identificaron esta problemática a través del análisis
            semanal de marcaje en el sistema Kronos. Las consecuencias son reales.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl ${p.bg} flex items-center justify-center mb-4`}>
                <p.icon className={`w-6 h-6 ${p.color}`} />
              </div>
              <h3 className="text-lg font-bold mb-2">{p.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Kronos badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left bg-card border border-border rounded-2xl p-6 max-w-2xl mx-auto shadow-sm"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BarChart2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="font-bold text-foreground">Sistema Kronos</p>
            <p className="text-muted-foreground text-sm">
              Los reportes semanales de marcaje son el punto de partida. TockTockAlarm es
              la solución práctica para cada trabajador.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
