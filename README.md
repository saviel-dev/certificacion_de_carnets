# Sistema de Carnets Empresarial

Sistema web moderno para la gestión integral de certificaciones y carnets de trabajadores con códigos QR para verificación digital.

## 📋 Descripción

Sistema de gestión empresarial diseñado para administrar, certificar y verificar los carnets de trabajadores mediante códigos QR únicos. Permite llevar un control completo del ciclo de vida de las credenciales, desde su creación hasta su verificación en tiempo real.

## ✨ Características Principales

### 🎯 Gestión de Trabajadores
- **Registro completo**: Datos personales, laborales y fotografías
- **Estados de carnet**: ACTIVO, INACTIVO, VENCIDO
- **Control de vigencia**: Fechas de inicio y expiración automáticas
- **ID interno único**: Sistema de identificación secuencial (ej: 2025-00001)
- **Búsqueda y filtrado**: Por nombre, cédula, departamento, estado

### 📱 Códigos QR
- **Generación automática**: Tokens únicos para cada trabajador
- **Verificación pública**: Validación de carnets mediante URL compartible
- **Revocación**: Capacidad de invalidar códigos QR cuando sea necesario
- **Descarga**: Exportación de códigos QR en formato imagen

### 📊 Dashboard y Estadísticas
- **Métricas en tiempo real**: Total de trabajadores, activos, vencidos
- **Contadores visuales**: Estadísticas de códigos QR generados
- **Alertas inteligentes**: Notificaciones de carnets próximos a vencer
- **Accesos rápidos**: Navegación directa a secciones principales

### 🔍 Auditoría
- **Registro completo**: Historial de todas las acciones realizadas
- **Trazabilidad**: Seguimiento de cambios en registros
- **Información detallada**: Usuario, fecha, hora y datos modificados

### 🔐 Seguridad
- **Autenticación**: Sistema de login seguro con Supabase Auth
- **Permisos**: Control de acceso basado en roles
- **Validación**: Verificación de tokens QR con múltiples estados

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para mayor robustez
- **Vite** - Build tool y servidor de desarrollo ultrarrápido
- **React Router** - Enrutamiento de aplicación SPA
- **TanStack Query** - Gestión de estado del servidor y caché

### UI/UX
- **Tailwind CSS** - Framework de utilidades CSS
- **shadcn/ui** - Componentes UI accesibles y personalizables
- **Radix UI** - Componentes primitivos sin estilos
- **Lucide React** - Iconos modernos y consistentes
- **Recharts** - Gráficos y visualizaciones de datos

### Backend y Base de Datos
- **Supabase** - Backend como servicio (BaaS)
  - PostgreSQL - Base de datos relacional
  - Auth - Autenticación y autorización
  - Storage - Almacenamiento de imágenes
  - Real-time - Actualizaciones en tiempo real

### Herramientas de Desarrollo
- **ESLint** - Linter para calidad de código
- **PostCSS** - Procesamiento de CSS
- **date-fns** - Manipulación de fechas
- **Zod** - Validación de esquemas
- **React Hook Form** - Manejo de formularios

## 🚀 Instalación y Configuración

### Requisitos Previos

- **Node.js** 18.x o superior
- **npm** o **bun** como gestor de paquetes
- Cuenta de **Supabase** configurada

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd "infinet tiuna empresarial"
```

2. **Instalar dependencias**
```bash
npm install
# o
bun install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=tu_clave_publica_de_supabase
```

4. **Configurar la base de datos**

Ejecuta las migraciones de Supabase para crear las tablas necesarias:

```bash
# Si usas Supabase CLI
supabase db push

# O ejecuta manualmente el archivo schema_completo.sql en tu proyecto de Supabase
```

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
# o
bun dev
```

La aplicación estará disponible en `http://localhost:8080`

## 📁 Estructura del Proyecto

```
infinet tiuna empresarial/
├── public/                 # Archivos estáticos
│   ├── img/               # Imágenes y logos
│   └── favicon.ico
├── src/
│   ├── components/         # Componentes React
│   │   ├── layout/        # Componentes de layout
│   │   ├── ui/            # Componentes UI reutilizables
│   │   └── workers/       # Componentes específicos de trabajadores
│   ├── hooks/             # Custom hooks
│   │   ├── useAuth.tsx    # Hook de autenticación
│   │   ├── useWorkers.ts  # Hook de gestión de trabajadores
│   │   └── useWorkerTour.ts
│   ├── integrations/      # Integraciones externas
│   │   └── supabase/      # Cliente y tipos de Supabase
│   ├── pages/             # Páginas de la aplicación
│   │   ├── Auth.tsx       # Página de autenticación
│   │   ├── Dashboard.tsx  # Panel principal
│   │   ├── Workers.tsx    # Gestión de trabajadores
│   │   ├── WorkerDetails.tsx
│   │   ├── Audit.tsx      # Registro de auditoría
│   │   └── Verify.tsx     # Verificación de QR
│   ├── types/             # Definiciones de tipos TypeScript
│   ├── lib/               # Utilidades y helpers
│   ├── App.tsx            # Componente raíz
│   └── main.tsx           # Punto de entrada
├── supabase/              # Configuración de Supabase
│   ├── migrations/        # Migraciones de base de datos
│   └── config.toml
├── schema_completo.sql    # Esquema completo de BD
└── package.json           # Dependencias y scripts
```

## 🎮 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo en puerto 8080

# Producción
npm run build           # Construye la aplicación para producción
npm run build:dev       # Construye en modo desarrollo
npm run preview         # Previsualiza la build de producción

# Calidad de código
npm run lint            # Ejecuta ESLint para verificar código
```

## 📖 Uso de la Aplicación

### Autenticación
1. Accede a la ruta `/auth`
2. Inicia sesión con tus credenciales de Supabase
3. Serás redirigido automáticamente al dashboard

### Gestión de Trabajadores
1. Desde el dashboard, haz clic en "Gestionar Carnets"
2. Usa el botón "Nuevo Trabajador" para crear un registro
3. Completa el formulario con los datos requeridos
4. Sube una fotografía del trabajador
5. Establece las fechas de vigencia del carnet

### Generación de Códigos QR
1. Accede al detalle de un trabajador
2. Haz clic en "Generar QR" o "Descargar QR"
3. El código QR se generará automáticamente
4. Comparte la URL de verificación o descarga la imagen

### Verificación de Carnets
1. Accede a la URL `/verify/:token` con el token del QR
2. El sistema validará automáticamente:
   - Si el token existe y es válido
   - Si el carnet está activo y vigente
   - Si el código QR no ha sido revocado

### Auditoría
1. Accede a la sección "Auditoría" desde el menú
2. Visualiza todos los cambios realizados en el sistema
3. Filtra por acción, tabla o usuario

## 🔧 Configuración de Supabase

### Tablas Principales

- **workers**: Almacena información de trabajadores
- **qr_codes**: Gestiona los códigos QR y tokens
- **audit_logs**: Registra todas las acciones del sistema

### Storage Buckets

- **worker-photos**: Almacenamiento público de fotografías de trabajadores

### Políticas de Seguridad

El sistema utiliza Row Level Security (RLS) de Supabase para garantizar que solo usuarios autenticados puedan:
- Crear, leer, actualizar trabajadores
- Generar y revocar códigos QR
- Acceder a los logs de auditoría

## 🌐 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. El despliegue se realizará automáticamente

### Otros Proveedores

El proyecto puede desplegarse en cualquier plataforma que soporte aplicaciones React/Vite:
- Netlify
- AWS Amplify
- Google Cloud Run
- Azure Static Web Apps

## 📝 Licencia

Este proyecto es privado y de uso empresarial.

## 👥 Soporte

Para soporte técnico o consultas, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para Infinet Tiuna Empresarial**
