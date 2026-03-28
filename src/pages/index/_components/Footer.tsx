import { AlarmClock } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <AlarmClock className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-black text-lg text-background">
                TockTock<span className="text-primary">Alarm</span>
              </p>
              <p className="text-xs text-background/60">Alarmas Inclusivas para Turnos</p>
            </div>
          </div>

          {/* Info */}
          <div className="text-center md:text-right text-sm text-background/60 space-y-1">
            <p>
              Proyecto académico — Ingeniería en Informática
            </p>
            <p>
              José Ricardo Antonio Díaz González · Sede San Joaquín
            </p>
            <p>
              Desarrollado en colaboración con Nestlé Chile y Sindicato N°1
            </p>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-6 text-center text-xs text-background/40">
          <p>© {year} TockTockAlarm. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
