-- ============================================================
-- Phorocket — Creación de BD en MySQL 8 (solo contenedor)
-- Las tablas las crea Prisma: pnpm db:push
-- Uso: mysql -u root -p < create-db.mysql.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS phorocket
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Usuario de aplicación (cambia la password)
CREATE USER IF NOT EXISTS 'phorocket_user'@'%' IDENTIFIED BY 'CambiaEstaPassword123!';
GRANT ALL PRIVILEGES ON phorocket.* TO 'phorocket_user'@'%';
FLUSH PRIVILEGES;

SELECT 'Listo. Siguiente paso: pnpm db:push (crea/actualiza las tablas desde schema.prisma).' AS mensaje;
