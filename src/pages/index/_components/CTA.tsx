import { AlarmClock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-white/10"
            style={{
              width: 200 + i * 200,
              height: 200 + i * 200,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <AlarmClock className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter text-balance mb-6">
            Empieza hoy.
            <br />
            No llegues tarde mañana.
          </h2>

          <p className="text-xl text-white/80 max-w-xl mx-auto mb-10">
            Configura tus turnos en 2 minutos. Gratis, sin registro de tarjeta,
            sin complicaciones.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/app">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 font-bold h-auto gap-2 shadow-2xl"
              >
                <AlarmClock className="w-5 h-5" />
                Abrir TockTockAlarm
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <p className="text-white/60 text-sm mt-8">
            Desarrollado para trabajadores de Nestlé y Sindicato N°1 · San Joaquín
          </p>
        </motion.div>
      </div>
    </section>
  );
}
