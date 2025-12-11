import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Loading state del auth hook
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f0f2f5]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Si el usuario ya está autenticado, redirigir al dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast.error(error.message || "Error al iniciar sesión");
        setIsLoading(false);
      } else {
        setIsSuccess(true);
        toast.success("¡Bienvenido!");
        // El loading permanece true y la redirección se maneja automáticamente
        // por el Navigate cuando user cambie a != null
      }
    } catch (err) {
      toast.error("Error inesperado al iniciar sesión");
      setIsLoading(false);
    }
  };

  // Variables de color para usar en el CSS-in-JS
  const darkGreen = "#064e3b"; // Emerald 900
  const brightGreen = "#10b981"; // Emerald 500

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      <style>{`
        /* From Uiverse.io by BHARGAVPATEL1244 - Adaptado */ 
        .uiverse-button {
          outline: none;
          cursor: pointer;
          border: none;
          padding: 0.9rem 2rem;
          margin: 0;
          font-family: inherit;
          position: relative;
          display: inline-block;
          letter-spacing: 0.05rem;
          font-weight: 700;
          font-size: 17px;
          border-radius: 10px; /* Border Radius solicitado */
          overflow: hidden;
          background: ${brightGreen}; /* Color de fondo al hacer hover (Verde brillante) */
          color: white; /* ghostwhite */
          width: 100%; /* Adaptado para llenar el formulario */
          height: 52px; /* Altura consistente */
        }

        .uiverse-button span {
          position: relative;
          z-index: 10;
          transition: color 0.4s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .uiverse-button:hover span {
          color: white; /* Mantener blanco o cambiar a oscuro si se prefiere contraste */
        }

        .uiverse-button::before,
        .uiverse-button::after {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .uiverse-button::before {
          content: "";
          background: ${darkGreen}; /* Color inicial (Verde oscuro) */
          width: 120%;
          left: -10%;
          transform: skew(30deg);
          transition: transform 0.4s cubic-bezier(0.3, 1, 0.8, 1);
        }

        .uiverse-button:hover::before {
          transform: translate3d(100%, 0, 0);
        }

        /* Estado deshabilitado para loading */
        .uiverse-button:disabled {
          opacity: 0.8;
          cursor: not-allowed;
          pointer-events: none;
        }
      `}</style>

      {/* Background decoration (Top Green Bar like MS Forms) */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-emerald-600 z-10"></div>

      <div className="w-full max-w-[440px] bg-white p-8 md:p-10 shadow-lg rounded-sm border border-slate-100 relative overflow-hidden transition-all duration-300 hover:shadow-xl mt-10">
        {/* Success Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <CheckCircle2
              size={64}
              className="text-emerald-600 mb-4 animate-bounce"
            />
            <h3 className="text-xl font-semibold text-slate-800">
              ¡Bienvenido!
            </h3>
            <p className="text-slate-500">Iniciando sesión...</p>
          </div>
        )}

        {/* Logo Section */}
        <div className="flex flex-col items-start mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white p-1 rounded-md shadow-sm">
              <img 
                src="/img/logo sin fondo.png" 
                alt="CertiCarnet Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              CertiCarnet
            </h1>
          </div>
          <p className="text-slate-500 text-sm">
            Sistema de Certificación de Trabajadores
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-slate-800">
              Iniciar Sesión
            </h2>
            <p className="text-sm text-slate-500">
              Ingresa tus credenciales para acceder
            </p>
          </div>

          <div className="space-y-5 mt-6">
            {/* Email Input */}
            <div className="relative group">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full h-11 border-b-[1.5px] border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600 placeholder-transparent bg-transparent transition-colors pt-1"
                placeholder="Correo electrónico"
                id="email"
                disabled={isLoading}
              />
              <label
                htmlFor="email"
                className="absolute left-0 -top-3.5 text-xs text-emerald-600 transition-all 
                peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-2.5 
                peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-emerald-600"
              >
                Correo electrónico
              </label>
              <Mail className="absolute right-0 top-3 text-slate-400 w-5 h-5 peer-focus:text-emerald-600 transition-colors" />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full h-11 border-b-[1.5px] border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600 placeholder-transparent bg-transparent transition-colors pt-1"
                placeholder="Contraseña"
                id="password"
                disabled={isLoading}
              />
              <label
                htmlFor="password"
                className="absolute left-0 -top-3.5 text-xs text-emerald-600 transition-all 
                peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-2.5 
                peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-emerald-600"
              >
                Contraseña
              </label>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-3 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="uiverse-button"
            >
              <span>
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    INGRESAR
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Footer Branding */}
      <div className="mt-8 flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
        <span className="text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} Tiunet. Todos los derechos reservados.
        </span>
      </div>
    </div>
  );
}
