-- ============================================================
-- KAIZEN SGSST — Configuración de Base de Datos Supabase
-- Ejecutar en el editor SQL de tu proyecto Supabase
-- ============================================================

-- 1. TABLA DE EMPRESAS
CREATE TABLE IF NOT EXISTS empresas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  nit VARCHAR(20),
  contacto VARCHAR(100),
  telefono VARCHAR(20),
  email VARCHAR(100),
  direccion TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE TRABAJADORES
CREATE TABLE IF NOT EXISTS trabajadores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  cargo VARCHAR(100),
  fecha_ingreso DATE,
  fecha_retiro DATE,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'retirado')),
  telefono VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE DOCUMENTOS SST (8 tipos por trabajador)
-- Tipos: arl, eps, pension, caja_compensacion, induccion_sst, dotacion_epp, alturas, reglamento_hsi
CREATE TABLE IF NOT EXISTS documentos_sst (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trabajador_id UUID REFERENCES trabajadores(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  fecha_emision DATE,
  fecha_vencimiento DATE,
  archivo_url TEXT,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trabajador_id, tipo)
);

-- 4. TABLA DE EXÁMENES MÉDICOS
CREATE TABLE IF NOT EXISTS examenes_medicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trabajador_id UUID REFERENCES trabajadores(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('ingreso', 'periodico', 'egreso', 'post_incapacidad')),
  fecha_examen DATE NOT NULL,
  fecha_vencimiento DATE,
  resultado VARCHAR(50) CHECK (resultado IN ('apto', 'apto_con_restricciones', 'no_apto', 'pendiente')),
  medico VARCHAR(100),
  ips VARCHAR(200),
  archivo_url TEXT,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STORAGE BUCKET para documentos
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-sst', 'documentos-sst', true)
ON CONFLICT (id) DO NOTHING;

-- 6. ROW LEVEL SECURITY (acceso abierto para demo — ajustar en producción)
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE trabajadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_sst ENABLE ROW LEVEL SECURITY;
ALTER TABLE examenes_medicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso total empresas" ON empresas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total trabajadores" ON trabajadores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total documentos_sst" ON documentos_sst FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total examenes_medicos" ON examenes_medicos FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Storage publico documentos-sst" ON storage.objects
  FOR ALL USING (bucket_id = 'documentos-sst')
  WITH CHECK (bucket_id = 'documentos-sst');

-- 7. DATOS DE MUESTRA
INSERT INTO empresas (nombre, nit, contacto, telefono, email, direccion) VALUES
  ('Constructora Horizonte S.A.S', '900.123.456-7', 'Carlos Ramírez', '300 123 4567', 'carlos@horizonte.co', 'Calle 80 # 45-23, Bogotá'),
  ('Industrias del Norte Ltda', '800.234.567-8', 'María González', '301 234 5678', 'maria@industrias.co', 'Carrera 15 # 12-34, Medellín'),
  ('Servicios Técnicos ABC', '700.345.678-9', 'Juan López', '302 345 6789', 'juan@servicios.co', 'Av. Principal # 67-89, Cali')
ON CONFLICT DO NOTHING;
