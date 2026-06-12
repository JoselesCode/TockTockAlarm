import {
  Accessibility as AccessibilityIcon,
  Bell,
  Brain,
  ChevronRight,
  Eye,
  Ear,
  Hand,
  Info,
  Palette,
  SlidersHorizontal,
  Sparkles,
  Type,
  Volume2,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

const quickModes = [
  {
    icon: Eye,
    title: "Baja visión",
    desc: "Texto grande y alto contraste",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    icon: Palette,
    title: "Daltonismo",
    desc: "Colores seguros",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
  {
    icon: Ear,
    title: "Audición",
    desc: "Vibración y alerta visual",
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-100 dark:bg-teal-900/30",
  },
  {
    icon: Hand,
    title: "Motricidad",
    desc: "Botones grandes",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-100 dark:bg-rose-900/30",
  },
  {
    icon: Brain,
    title: "Cognitiva",
    desc: "Interfaz simple",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
];

const a11yFeatures = [
  {
    icon: Eye,
    title: "Baja visión",
    desc: "Modo pensado para personas con visión reducida. Aumenta el tamaño del texto, mejora el contraste y hace que las alarmas sean más fáciles de leer.",
    detail: "Texto grande + alto contraste",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    preview: (
      <div className="mt-4 rounded-2xl bg-muted p-4">
        <p className="text-3xl font-black text-foreground">06:00</p>
        <p className="text-base font-semibold text-muted-foreground">
          Salir al trabajo
        </p>
      </div>
    ),
  },
  {
    icon: Palette,
    title: "Modo daltonismo",
    desc: "Los turnos usan colores diferenciados para evitar confusiones entre mañana, tarde y noche. Además, cada turno puede acompañarse con texto o iconos.",
    detail: "Paleta segura para turnos",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    preview: (
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-amber-500 p-3 text-center text-white">
          <p className="text-sm font-black">AM</p>
          <p className="text-[11px] font-semibold">Mañana</p>
        </div>
        <div className="rounded-xl bg-teal-500 p-3 text-center text-white">
          <p className="text-sm font-black">PM</p>
          <p className="text-[11px] font-semibold">Tarde</p>
        </div>
        <div className="rounded-xl bg-indigo-700 p-3 text-center text-white">
          <p className="text-sm font-black">NOC</p>
          <p className="text-[11px] font-semibold">Noche</p>
        </div>
      </div>
    ),
  },
  {
    icon: Ear,
    title: "Audición reducida",
    desc: "Permite combinar sonido, vibración y alerta visual para que la alarma no dependa solamente del audio.",
    detail: "Sonido + vibración + visual",
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-100 dark:bg-teal-900/30",
    preview: (
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-primary/10 p-3 text-center">
          <Volume2 className="mx-auto mb-1 h-6 w-6 text-primary" />
          <p className="text-xs font-bold text-primary">Sonido</p>
        </div>
        <div className="rounded-xl bg-muted p-3 text-center">
          <Zap className="mx-auto mb-1 h-6 w-6 text-muted-foreground" />
          <p className="text-xs font-bold text-muted-foreground">Vibración</p>
        </div>
        <div className="rounded-xl bg-rose-100 p-3 text-center dark:bg-rose-900/30">
          <Bell className="mx-auto mb-1 h-6 w-6 text-rose-600 dark:text-rose-400" />
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
            Visual
          </p>
        </div>
      </div>
    ),
  },
  {
    icon: Hand,
    title: "Movilidad reducida",
    desc: "Botones grandes, acciones claras y menos pasos para activar o desactivar turnos. Ideal para usuarios que necesitan una navegación más simple.",
    detail: "Menos toques, más claridad",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-100 dark:bg-rose-900/30",
    preview: (
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-primary p-4 text-center text-primary-foreground">
          <p className="text-sm font-black">Activar turno</p>
        </div>
        <div className="rounded-xl bg-muted p-4 text-center text-muted-foreground">
          <p className="text-sm font-black">Editar</p>
        </div>
      </div>
    ),
  },
  {
    icon: Brain,
    title: "Apoyo cognitivo",
    desc: "La interfaz evita información innecesaria y muestra instrucciones breves para que el usuario entienda qué debe hacer en cada pantalla.",
    detail: "Pasos simples y guiados",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    preview: (
      <div className="mt-4 rounded-2xl bg-muted p-4">
        <p className="mb-2 text-sm font-black text-foreground">
          Próxima acción
        </p>
        <p className="text-sm font-medium text-muted-foreground">
          Elige tu turno actual y confirma tus alarmas.
        </p>
      </div>
    ),
  },
  {
    icon: SlidersHorizontal,
    title: "Alarma personalizada",
    desc: "Cada trabajador puede adaptar la alarma según su necesidad: solo sonido, solo vibración, ambos o aviso visual.",
    detail: "Configuración adaptable",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    preview: (
      <div className="mt-4 grid grid-cols-4 gap-2">
        {["Sonido", "Vibrar", "Ambos", "Visual"].map((item, index) => (
          <div
            key={item}
            className={`rounded-xl p-3 text-center text-xs font-bold ${
              index === 0
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {item}
          </div>
        ))}
      </div>
    ),
  },
];

export default function Accessibility() {
  return (
    <section id="accesibilidad" className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            <AccessibilityIcon className="h-4 w-4" />
            Diseño inclusivo
          </div>

          <h2 className="mb-4 text-balance text-4xl font-black tracking-tighter md:text-5xl">
            Accesible para <span className="text-primary">todos</span>
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            TockTockAlarm incorpora opciones para personas con baja visión,
            daltonismo, audición reducida, movilidad reducida y usuarios que
            necesitan una experiencia más simple.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5"
        >
          {quickModes.map((mode) => (
            <div
              key={mode.title}
              className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${mode.bg}`}
              >
                <mode.icon className={`h-6 w-6 ${mode.color}`} />
              </div>
              <h3 className="text-sm font-black text-foreground">
                {mode.title}
              </h3>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                {mode.desc}
              </p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {a11yFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${f.bg}`}
                  >
                    <f.icon className={`h-6 w-6 ${f.color}`} />
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-foreground">
                      {f.title}
                    </h3>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {f.detail}
                    </span>
                  </div>
                </div>

                <ChevronRight className="mt-2 h-5 w-5 text-muted-foreground" />
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>

              {f.preview}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-8 rounded-2xl border border-purple-200 bg-purple-50 p-5 dark:border-purple-700 dark:bg-purple-900/20"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/40">
              <Info className="h-5 w-5 text-purple-700 dark:text-purple-300" />
            </div>

            <div>
              <h3 className="font-black text-purple-800 dark:text-purple-200">
                TockTockAlarm se adapta al trabajador
              </h3>
              <p className="mt-1 text-sm font-medium leading-relaxed text-purple-700 dark:text-purple-300">
                La accesibilidad no es solo visual: también considera sonido,
                vibración, navegación simple, botones grandes y alertas claras
                para distintos contextos laborales.
              </p>
            </div>

            <Sparkles className="ml-auto hidden h-5 w-5 text-purple-700 dark:text-purple-300 md:block" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}