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
    };

    // Prevent screen capture behavior (key combinations)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Print Screen
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText(''); // Clear clipboard (best effort)
        alert('Las capturas de pantalla están deshabilitadas por seguridad.');
      }
      
      // Ctrl/Cmd + Shift + I (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault();
      }
      
      // Ctrl/Cmd + Shift + C (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
      }
      
      // Ctrl/Cmd + U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
      }
      
      // Ctrl/Cmd + S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
      }
      
      // Ctrl/Cmd + P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
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
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat select-none print:hidden"
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
                    className="h-full w-full object-cover"
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
  );
}
