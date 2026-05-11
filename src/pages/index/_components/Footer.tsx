import { useState } from "react";

import {
  AlarmClock,
  Mail,
  Phone,
  MapPin,
  Github,
  ShieldCheck,
  Accessibility,
  Clock3,
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleFakeSubmit() {
    if (!name || !email || !message) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);

      setName("");
      setEmail("");
      setMessage("");

      setTimeout(() => {
        setIsSent(false);
      }, 3000);
    }, 3000);
  }

  return (
    <footer className="bg-foreground text-background pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                <AlarmClock className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>

              <div>
                <h2 className="font-black text-2xl text-background">
                  TockTock<span className="text-primary">Alarm</span>
                </h2>

                <p className="text-sm text-background/60">
                  Gestión inteligente de turnos y asistencia
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-background/70">
              Plataforma diseñada para trabajadores con turnos rotativos,
              integrando alarmas inteligentes, marcaje geolocalizado,
              accesibilidad inclusiva y monitoreo RRHH mediante dashboards
              analíticos.
            </p>

            <div className="flex items-center gap-3 mt-6">
              <div className="rounded-xl border border-background/10 px-3 py-2 text-xs text-background/70 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                Firebase Secure
              </div>

              <div className="rounded-xl border border-background/10 px-3 py-2 text-xs text-background/70 flex items-center gap-2">
                <Accessibility className="w-4 h-4 text-primary" />
                Inclusivo
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-5">Navegación</h3>

            <div className="space-y-3 text-sm text-background/70">
              <a href="#inicio" className="block hover:text-primary transition">
                Inicio
              </a>

              <a href="#problema" className="block hover:text-primary transition">
                Problemática
              </a>

              <a href="#funcionalidades" className="block hover:text-primary transition">
                Funcionalidades
              </a>

              <a href="#accesibilidad" className="block hover:text-primary transition">
                Accesibilidad
              </a>

              <a href="/app/dashboard" className="block hover:text-primary transition">
                Panel RRHH
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-5">Características</h3>

            <div className="space-y-4 text-sm text-background/70">
              <div className="flex items-start gap-3">
                <Clock3 className="w-4 h-4 text-primary mt-0.5" />
                <p>Alarmas inteligentes por turnos rotativos.</p>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <p>Marcaje con geolocalización y validación de ubicación.</p>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-primary mt-0.5" />
                <p>Dashboard RRHH con métricas y análisis histórico.</p>
              </div>

              <div className="flex items-start gap-3">
                <Accessibility className="w-4 h-4 text-primary mt-0.5" />
                <p>Diseño accesible para distintos perfiles de usuarios.</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-5">Contacto y soporte</h3>

            <form className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre"
                className="w-full rounded-xl border border-background/10 bg-background/5 px-4 py-3 text-sm text-background placeholder:text-background/40 outline-none"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                className="w-full rounded-xl border border-background/10 bg-background/5 px-4 py-3 text-sm text-background placeholder:text-background/40 outline-none"
              />

              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="w-full rounded-xl border border-background/10 bg-background/5 px-4 py-3 text-sm text-background placeholder:text-background/40 outline-none resize-none"
              />

              <button
                type="button"
                disabled={isLoading}
                onClick={handleFakeSubmit}
                className={`w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition ${
                  isSent
                    ? "bg-green-600"
                    : isLoading
                    ? "bg-primary/70"
                    : "bg-primary hover:opacity-90"
                }`}
              >
                {isLoading
                  ? "Enviando solicitud..."
                  : isSent
                  ? "Solicitud enviada correctamente"
                  : "Enviar solicitud"}
              </button>
            </form>

            <div className="space-y-3 mt-6 text-sm text-background/60">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span>support@tocktockalarm.cl</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span>+56 9 5555 5555</span>
              </div>

              <div className="flex items-center gap-3">
                <Github className="w-4 h-4 text-primary" />
                <span>github.com/JoselesCode/TockTockAlarm</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-14 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/40 text-center md:text-left">
            © {year} TockTockAlarm. Plataforma de gestión de turnos,
            alarmas inteligentes y asistencia laboral.
          </p>

          <div className="flex items-center gap-4 text-xs text-background/40">
            <span>React + Firebase</span>
            <span>•</span>
            <span>PWA Ready</span>
            <span>•</span>
            <span>Dashboard Analytics</span>
          </div>
        </div>
      </div>
    </footer>
  );
}