import { AlarmClock, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1742281693490-82f07a4d2391?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/8" />
        {/* Radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Animated background clock rings */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-primary/10"
            style={{ width: 200 + i * 180, height: 200 + i * 180 }}
            animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-full px-4 py-2 text-sm font-semibold mb-8"
        >
          <ShieldCheck className="w-4 h-4" />
          Alarmas inclusivas para turnos rotativos
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tighter text-balance mb-6 leading-[1.05]"
        >
          Nunca más
          <br />
          <span className="text-primary">llegues tarde</span>
          <br />
          al trabajo
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-balance mb-10 leading-relaxed"
        >
          Agrupa tus alarmas por turno. Cambia de Turno Mañana a Turno Noche en un solo toque.
          Diseñado para trabajadores de producción, accesible para todos.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to="/app">
            <Button size="lg" className="text-lg px-8 py-6 font-bold shadow-xl gap-2 h-auto">
              <AlarmClock className="w-5 h-5" />
              Comenzar Ahora
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <a href="#como-funciona">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 font-semibold h-auto gap-2">
              <Clock className="w-5 h-5" />
              Ver cómo funciona
            </Button>
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {[
            { value: "3 turnos", label: "Mañana, Tarde, Noche" },
            { value: "100%", label: "Gratis para trabajadores" },
            { value: "Accesible", label: "Daltonismo y 3ª edad" },
            { value: "Offline", label: "Sin internet necesario" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-2xl p-4 shadow-sm"
            >
              <div className="text-2xl font-black text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1 leading-tight">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
