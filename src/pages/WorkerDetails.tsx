import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useWorker } from "@/hooks/useWorkers";
import { Button } from "@/components/ui/button";

import { ArrowLeft, QrCode } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

export default function WorkerDetails() {
  const { id } = useParams<{ id: string }>();
  // const navigate = useNavigate();
  const { data: worker, isLoading } = useWorker(id || "");

  useEffect(() => {
    // Prevent right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent screen capture behavior (key combinations)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Print Screen
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText(''); // Clear clipboard (best effort)
        alert('Las capturas de pantalla están deshabilitadas por seguridad.');
      }
      
      // Ctrl/Cmd + Shift + I/J/C (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault();
      }
      
      // Ctrl/Cmd + U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
      }
      
      // Ctrl/Cmd + S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
      }
      
      // Ctrl/Cmd + P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
      }

      // Mac Screenshot shortcuts (Cmd+Shift+3, Cmd+Shift+4) - Browser might not catch these but good to try
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        navigator.clipboard.writeText('');
      }
    };

    // Blur content when window loses focus (e.g. when opening snipping tool)
    const handleVisibilityChange = () => {
      const content = document.getElementById('worker-content');
      const overlay = document.getElementById('security-overlay');
      
      if (document.hidden) {
        if (content) content.style.filter = 'blur(20px)';
        if (overlay) overlay.style.display = 'flex';
      } else {
        if (content) content.style.filter = 'none';
        if (overlay) overlay.style.display = 'none';
      }
    };

    // More aggressive blur on window blur (alt-tab, clicking away)
    const handleWindowBlur = () => {
      const content = document.getElementById('worker-content');
      const overlay = document.getElementById('security-overlay');
      if (content) content.style.filter = 'blur(20px)';
      if (overlay) overlay.style.display = 'flex';
    };

    const handleWindowFocus = () => {
      const content = document.getElementById('worker-content');
      const overlay = document.getElementById('security-overlay');
      if (content) content.style.filter = 'none';
      if (overlay) overlay.style.display = 'none';
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  if (!worker)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Trabajador no encontrado
      </div>
    );

  const fullName = `${worker.first_name} ${worker.last_name}`;
  const activeQR = worker.qr_codes?.find((qr) => !qr.is_revoked);

  return (
    <>
      <div 
        id="security-overlay"
        className="fixed inset-0 z-[9999] bg-black/80 hidden items-center justify-center backdrop-blur-md"
      >
        <div className="text-center p-6 bg-white rounded-xl shadow-2xl max-w-sm mx-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Contenido Protegido</h3>
          <p className="text-gray-600">
            Por seguridad, el contenido se oculta cuando la ventana pierde el foco o se intenta capturar pantalla.
          </p>
        </div>
      </div>

      <div 
        id="worker-content"
        className="min-h-screen bg-cover bg-center bg-no-repeat select-none print:hidden transition-all duration-200"
        style={{ backgroundImage: "url('/img/wallpaper.png')" }}
      >

        <div className="container mx-auto p-4 flex flex-col items-center">


          {/* MAIN CARD - The Green Design */}
          <div className="w-full max-w-[500px] bg-[#22c55e] rounded-2xl shadow-2xl overflow-hidden relative">
            {/* Header Content */}
            <div className="pt-10 pb-6 flex flex-col items-center text-center px-4">
              {/* Profile Image */}
              <div className="relative mb-3">
                <div className="h-32 w-32 rounded-full border-[5px] border-white overflow-hidden bg-white shadow-md">
                  {worker.photo_url ? (
                    <img
                      src={worker.photo_url}
                      alt={fullName}
                      className="h-full w-full object-cover pointer-events-none"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">
                      <span className="text-2xl font-bold">
                        {worker.first_name?.[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Name & ID */}
              <h1 className="text-white text-2xl font-bold capitalize tracking-wide mb-1">
                {fullName}
              </h1>
              <p className="text-green-100 text-sm opacity-90">
                ID: {worker.internal_id}
              </p>
            </div>

            {/* White Info Panel */}
            <div className="bg-white mx-4 mb-4 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-center text-gray-800 mb-6 capitalize">
                información Personal
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                {/* Column 1 */}
                <div className="space-y-1">
                  <p className="text-gray-900 font-bold text-base leading-none">
                    Cargo:
                  </p>
                  <p className="text-gray-600 capitalize text-sm">
                    {worker.position || "N/A"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-gray-900 font-bold text-base leading-none">
                    Departamento:
                  </p>
                  <p className="text-gray-600 capitalize text-sm">
                    {worker.department || "N/A"}.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-gray-900 font-bold text-base leading-none">
                    cedula:
                  </p>
                  <p className="text-gray-600 text-sm">
                    {worker.cedula || "N/A"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-gray-900 font-bold text-base leading-none">
                    Telefono:
                  </p>
                  <p className="text-gray-600 text-sm">{worker.phone || "N/A"}</p>
                </div>

                {/* Full width for Email if needed, or stick to grid */}
                <div className="space-y-1 col-span-1 md:col-span-1">
                  <p className="text-gray-900 font-bold text-base leading-none">
                    Correo electronico
                  </p>
                  <p
                    className="text-gray-600 text-sm truncate"
                    title={worker.email}
                  >
                    {worker.email || "N/A"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-gray-900 font-bold text-base leading-none">
                    Estado:
                  </p>
                  <p
                    className={`text-base font-bold uppercase ${
                      worker.status === "ACTIVO"
                        ? "text-[#22c55e]"
                        : "text-gray-500"
                    }`}
                  >
                    {worker.status || "N/A"}
                  </p>
                </div>
              </div>

              {/* Footer Date */}
              <div className="mt-10 text-center border-t border-transparent pt-2">
                <p className="text-gray-500 text-sm">
                  Valido hasta el{" "}
                  {worker.valid_until
                    ? format(new Date(worker.valid_until), "dd/MM/yyyy")
                    : "Indefinido"}
                </p>
              </div>
            </div>

            {/* Bottom spacer in green card */}
            <div className="h-2"></div>
          </div>
        </div>
      </div>
    </>
  );
}
