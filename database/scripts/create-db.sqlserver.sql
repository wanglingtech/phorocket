/* ============================================================
   Phorocket — Creación de BD y login en SQL SERVER
   (solo contenedor: base de datos + login)
   Las tablas las crea Prisma: pnpm db:push
   Uso: sqlcmd -S localhost,1433 -E -i create-db.sqlserver.sql
   ============================================================ */

-- 1. Base de datos -------------------------------------------------
IF DB_ID(N'phorocket') IS NULL
BEGIN
    CREATE DATABASE phorocket;
    PRINT 'Base de datos phorocket creada.';
END
ELSE
    PRINT 'La base de datos phorocket ya existe.';
GO

-- 2. Login de aplicación + usuario en la BD ------------------------
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'phorocket_user')
BEGIN
    CREATE LOGIN phorocket_user WITH PASSWORD = N'CambiaEstaPassword123!';
    PRINT 'Login phorocket_user creado.';
END
ELSE
    PRINT 'El login phorocket_user ya existe.';
GO

USE phorocket;
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'phorocket_user')
BEGIN
    CREATE USER phorocket_user FOR LOGIN phorocket_user;
    ALTER ROLE db_owner ADD MEMBER phorocket_user;
    PRINT 'Usuario phorocket_user añadido como db_owner.';
END
GO

PRINT 'Listo. Siguiente paso: pnpm db:push (crea/actualiza las tablas desde schema.prisma).';
GO
