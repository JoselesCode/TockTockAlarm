import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  function handleLogin() {
    navigate("/app/home");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md rounded-2xl border p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Acceso</h1>
        <p className="text-muted-foreground mb-6">
          Inicia sesión con Google para acceder a TockTockAlarm.
        </p>

        <button
          onClick={handleLogin}
          className="w-full rounded-xl px-4 py-3 font-semibold border"
        >
          Ingresar con Google
        </button>
      </div>
    </main>
  );
}
