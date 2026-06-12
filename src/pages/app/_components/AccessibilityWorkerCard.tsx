import {
  Accessibility,
  Brain,
  Ear,
  Eye,
  Hand,
  Palette,
  Volume2,
  Zap,
} from "lucide-react";

const options = [
  {
    Icon: Eye,
    title: "Baja visión",
    desc: "Texto grande y alto contraste",
  },
  {
    Icon: Palette,
    title: "Daltonismo",
    desc: "Colores seguros por turno",
  },
  {
    Icon: Ear,
    title: "Audición",
    desc: "Vibración y alerta visual",
  },
  {
    Icon: Hand,
    title: "Motricidad",
    desc: "Botones grandes y menos pasos",
  },
  {
    Icon: Brain,
    title: "Uso simple",
    desc: "Pantallas claras y guiadas",
  },
];

export default function AccessibilityWorkerCard() {
  return (
    <section
      id="accesibilidad-app"
      className="rounded-2xl border border-purple-200 bg-purple-50 p-5 dark:border-purple-700 dark:bg-purple-900/20"
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/40">
          <Accessibility className="h-6 w-6 text-purple-700 dark:text-purple-300" />
        </div>

        <div>
          <h2 className="text-lg font-black text-purple-900 dark:text-purple-100">
            Opciones para trabajadores/as
          </h2>
          <p className="text-sm font-medium leading-relaxed text-purple-700 dark:text-purple-300">
            TockTockAlarm se adapta a personas con distintas capacidades para
            facilitar el uso diario de turnos y alarmas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-xl border border-purple-200 bg-background p-4 dark:border-purple-800"
          >
            <div className="mb-2 flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="font-black">{title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-primary/10 p-3 text-center">
          <Volume2 className="mx-auto mb-1 h-5 w-5 text-primary" />
          <p className="text-xs font-black text-primary">Sonido</p>
        </div>

        <div className="rounded-xl bg-primary/10 p-3 text-center">
          <Zap className="mx-auto mb-1 h-5 w-5 text-primary" />
          <p className="text-xs font-black text-primary">Vibración</p>
        </div>

        <div className="rounded-xl bg-primary/10 p-3 text-center">
          <Eye className="mx-auto mb-1 h-5 w-5 text-primary" />
          <p className="text-xs font-black text-primary">Visual</p>
        </div>
      </div>
    </section>
  );
}