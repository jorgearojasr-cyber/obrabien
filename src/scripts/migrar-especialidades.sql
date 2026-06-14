-- ============================================================
-- Migración de especialidades — ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Actualizar especialidad principal (columna texto)
UPDATE maestros SET especialidad = 'Enfierradura y Soldadura'
WHERE especialidad = 'Fierrería / Soldadura';

UPDATE maestros SET especialidad = 'Enlucidos'
WHERE especialidad = 'Yesería';

UPDATE maestros SET especialidad = 'Paneles Solares'
WHERE especialidad = 'Paneles solares';

-- 2. Eliminar especialidades que ya no existen
UPDATE maestros SET especialidad = NULL
WHERE especialidad IN ('Plomería', 'Instalación de cocinas');

-- 3. Actualizar array de otras especialidades (si existe esa columna)
UPDATE maestros SET otras_especialidades =
  array_replace(otras_especialidades, 'Fierrería / Soldadura', 'Enfierradura y Soldadura')
WHERE 'Fierrería / Soldadura' = ANY(otras_especialidades);

UPDATE maestros SET otras_especialidades =
  array_replace(otras_especialidades, 'Yesería', 'Enlucidos')
WHERE 'Yesería' = ANY(otras_especialidades);

UPDATE maestros SET otras_especialidades =
  array_replace(otras_especialidades, 'Paneles solares', 'Paneles Solares')
WHERE 'Paneles solares' = ANY(otras_especialidades);

UPDATE maestros SET otras_especialidades =
  array_remove(otras_especialidades, 'Plomería')
WHERE 'Plomería' = ANY(otras_especialidades);

UPDATE maestros SET otras_especialidades =
  array_remove(otras_especialidades, 'Instalación de cocinas')
WHERE 'Instalación de cocinas' = ANY(otras_especialidades);

-- 4. Actualizar array de especialidades (columna principal si es array)
UPDATE maestros SET especialidades =
  array_replace(especialidades, 'Fierrería / Soldadura', 'Enfierradura y Soldadura')
WHERE 'Fierrería / Soldadura' = ANY(especialidades);

UPDATE maestros SET especialidades =
  array_replace(especialidades, 'Yesería', 'Enlucidos')
WHERE 'Yesería' = ANY(especialidades);

UPDATE maestros SET especialidades =
  array_replace(especialidades, 'Paneles solares', 'Paneles Solares')
WHERE 'Paneles solares' = ANY(especialidades);

UPDATE maestros SET especialidades =
  array_remove(especialidades, 'Plomería')
WHERE 'Plomería' = ANY(especialidades);

UPDATE maestros SET especialidades =
  array_remove(especialidades, 'Instalación de cocinas')
WHERE 'Instalación de cocinas' = ANY(especialidades);

-- 5. Verificar resultados
SELECT id, especialidad, especialidades, otras_especialidades
FROM maestros
WHERE especialidad IN ('Enfierradura y Soldadura','Enlucidos','Paneles Solares')
   OR 'Enfierradura y Soldadura' = ANY(especialidades)
   OR 'Enlucidos' = ANY(especialidades)
   OR 'Paneles Solares' = ANY(especialidades)
ORDER BY especialidad;
