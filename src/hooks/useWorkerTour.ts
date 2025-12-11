import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function useWorkerTour() {
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      progressText: '{{current}} de {{total}}',
      popoverClass: 'worker-tour-popover',
      steps: [
        {
          element: '#new-worker-btn',
          popover: {
            title: '¡Bienvenido! 👋',
            description: 'Este tour te guiará paso a paso para agregar un nuevo trabajador. Comencemos haciendo clic en el botón "Nuevo Trabajador".',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          popover: {
            title: 'Paso 1: Datos Personales 📝',
            description: 'Primero necesitamos los datos básicos del trabajador: Nombre, Apellido y Cédula. Estos campos son obligatorios.',
          }
        },
        {
          popover: {
            title: 'Paso 2: Foto del Trabajador 📸',
            description: 'Sube una foto clara del trabajador. Esta foto aparecerá en el carnet digital. Puedes arrastrar y soltar la imagen o hacer clic para seleccionarla.',
          }
        },
        {
          popover: {
            title: 'Paso 3: Información Laboral 💼',
            description: 'Ingresa el Cargo y Departamento del trabajador. Estos datos son importantes para identificar su rol en la organización.',
          }
        },
        {
          popover: {
            title: 'Paso 4: Datos de Contacto 📞',
            description: 'Opcionalmente puedes agregar Teléfono y Correo electrónico para tener información de contacto del trabajador.',
          }
        },
        {
          popover: {
            title: 'Paso 5: Estado y Vigencia 📅',
            description: 'Selecciona el estado del trabajador (ACTIVO, INACTIVO, VENCIDO) y define las fechas de vigencia del carnet. La fecha "Válido hasta" determina cuándo expirará el carnet.',
          }
        },
        {
          popover: {
            title: 'Paso 6: Guardar ✅',
            description: 'Una vez completados todos los campos, haz clic en "Guardar" para crear el trabajador. El sistema generará automáticamente un ID único.',
          }
        },
        {
          element: '#workers-grid',
          popover: {
            title: '¡Listo! 🎉',
            description: 'El nuevo trabajador aparecerá aquí en el listado. Puedes ver su perfil, editar información, generar código QR o eliminarlo desde las opciones de cada tarjeta.',
            side: 'top',
            align: 'center'
          }
        }
      ],
    });

    driverObj.drive();
  };

  return { startTour };
}
