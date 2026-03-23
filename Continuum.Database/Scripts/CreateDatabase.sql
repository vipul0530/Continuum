-- =============================================================================
-- Continuum — SAR-7 Outreach Platform
-- Database setup script for SQL Server 2022 Express (.\SQLEXPRESS)
--
-- Run this in SSMS connected to: .\SQLEXPRESS
-- This is idempotent — safe to re-run; it won't destroy existing data.
-- =============================================================================

-- ── 1. Create database ────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'Continuum_Dev')
BEGIN
    CREATE DATABASE [Continuum_Dev]
        COLLATE SQL_Latin1_General_CP1_CI_AS;
    PRINT 'Database Continuum_Dev created.';
END
ELSE
    PRINT 'Database Continuum_Dev already exists — skipped.';
GO

USE [Continuum_Dev];
GO

-- ── 2. EF Core migration history table ───────────────────────────────────────
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_NAME = '__EFMigrationsHistory'
)
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId]    nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32)  NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory]
            PRIMARY KEY ([MigrationId])
    );
    PRINT 'Table __EFMigrationsHistory created.';
END
GO

-- ── 3. Counties ───────────────────────────────────────────────────────────────
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Counties'
)
BEGIN
    CREATE TABLE [Counties] (
        [Id]        int            NOT NULL IDENTITY(1,1),
        [Name]      nvarchar(100)  NOT NULL,
        [FipsCode]  nvarchar(10)   NOT NULL,
        [IsActive]  bit            NOT NULL,
        [CreatedAt] datetime2      NOT NULL,
        CONSTRAINT [PK_Counties] PRIMARY KEY ([Id])
    );

    CREATE UNIQUE INDEX [IX_Counties_FipsCode]
        ON [Counties] ([FipsCode]);

    PRINT 'Table Counties created.';
END
GO

-- ── 4. Clients ────────────────────────────────────────────────────────────────
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Clients'
)
BEGIN
    CREATE TABLE [Clients] (
        [Id]                int           NOT NULL IDENTITY(1,1),
        [CountyId]          int           NOT NULL,
        [FirstName]         nvarchar(100) NOT NULL,
        [LastName]          nvarchar(100) NOT NULL,
        [PhoneNumber]       nvarchar(20)  NULL,
        [Email]             nvarchar(256) NULL,
        [PreferredLanguage] nvarchar(5)   NOT NULL DEFAULT N'en',
        [CalSawsId]         nvarchar(50)  NULL,
        [CreatedAt]         datetime2     NOT NULL,
        [UpdatedAt]         datetime2     NOT NULL,
        CONSTRAINT [PK_Clients] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Clients_Counties_CountyId]
            FOREIGN KEY ([CountyId]) REFERENCES [Counties] ([Id])
            ON DELETE NO ACTION
    );

    CREATE INDEX [IX_Clients_CountyId]
        ON [Clients] ([CountyId]);

    PRINT 'Table Clients created.';
END
GO

-- ── 5. Workers ────────────────────────────────────────────────────────────────
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Workers'
)
BEGIN
    CREATE TABLE [Workers] (
        [Id]           int           NOT NULL IDENTITY(1,1),
        [CountyId]     int           NOT NULL,
        [Email]        nvarchar(256) NOT NULL,
        [FirstName]    nvarchar(100) NOT NULL,
        [LastName]     nvarchar(100) NOT NULL,
        [Role]         nvarchar(max) NOT NULL,
        [PasswordHash] nvarchar(max) NULL,
        [ExternalId]   nvarchar(max) NULL,
        [IsActive]     bit           NOT NULL,
        [CreatedAt]    datetime2     NOT NULL,
        [UpdatedAt]    datetime2     NOT NULL,
        CONSTRAINT [PK_Workers] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Workers_Counties_CountyId]
            FOREIGN KEY ([CountyId]) REFERENCES [Counties] ([Id])
            ON DELETE NO ACTION
    );

    CREATE UNIQUE INDEX [IX_Workers_Email]
        ON [Workers] ([Email]);

    CREATE INDEX [IX_Workers_CountyId]
        ON [Workers] ([CountyId]);

    PRINT 'Table Workers created.';
END
GO

-- ── 6. Cases ──────────────────────────────────────────────────────────────────
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Cases'
)
BEGIN
    CREATE TABLE [Cases] (
        [Id]               int           NOT NULL IDENTITY(1,1),
        [CountyId]         int           NOT NULL,
        [ClientId]         int           NOT NULL,
        [CaseNumber]       nvarchar(50)  NOT NULL,
        [SarDueDate]       datetime2     NOT NULL,
        [Status]           nvarchar(max) NOT NULL,
        [UrgencyLevel]     nvarchar(max) NOT NULL,
        [IsAtRisk]         bit           NOT NULL,
        [OutreachAttempts] int           NOT NULL,
        [LastOutreachAt]   datetime2     NULL,
        [SubmittedAt]      datetime2     NULL,
        [CreatedAt]        datetime2     NOT NULL,
        [UpdatedAt]        datetime2     NOT NULL,
        CONSTRAINT [PK_Cases] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Cases_Counties_CountyId]
            FOREIGN KEY ([CountyId]) REFERENCES [Counties] ([Id])
            ON DELETE NO ACTION,
        CONSTRAINT [FK_Cases_Clients_ClientId]
            FOREIGN KEY ([ClientId]) REFERENCES [Clients] ([Id])
            ON DELETE NO ACTION
    );

    CREATE UNIQUE INDEX [IX_Cases_CountyId_CaseNumber]
        ON [Cases] ([CountyId], [CaseNumber]);

    CREATE INDEX [IX_Cases_ClientId]
        ON [Cases] ([ClientId]);

    PRINT 'Table Cases created.';
END
GO

-- ── 7. OutreachLogs ───────────────────────────────────────────────────────────
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'OutreachLogs'
)
BEGIN
    CREATE TABLE [OutreachLogs] (
        [Id]                int           NOT NULL IDENTITY(1,1),
        [CaseId]            int           NOT NULL,
        [CountyId]          int           NOT NULL,
        [Channel]           nvarchar(max) NOT NULL,
        [Status]            nvarchar(max) NOT NULL,
        [MessageTemplate]   nvarchar(100) NOT NULL,
        [MessageBody]       nvarchar(max) NULL,
        [ExternalMessageId] nvarchar(max) NULL,
        [DaysBeforeDue]     int           NOT NULL,
        [SentAt]            datetime2     NOT NULL,
        [DeliveredAt]       datetime2     NULL,
        [ErrorMessage]      nvarchar(max) NULL,
        CONSTRAINT [PK_OutreachLogs] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_OutreachLogs_Cases_CaseId]
            FOREIGN KEY ([CaseId]) REFERENCES [Cases] ([Id])
            ON DELETE CASCADE,
        CONSTRAINT [FK_OutreachLogs_Counties_CountyId]
            FOREIGN KEY ([CountyId]) REFERENCES [Counties] ([Id])
            ON DELETE NO ACTION
    );

    CREATE INDEX [IX_OutreachLogs_CaseId]
        ON [OutreachLogs] ([CaseId]);

    CREATE INDEX [IX_OutreachLogs_CountyId]
        ON [OutreachLogs] ([CountyId]);

    PRINT 'Table OutreachLogs created.';
END
GO

-- ── 8. SarSubmissions ─────────────────────────────────────────────────────────
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SarSubmissions'
)
BEGIN
    CREATE TABLE [SarSubmissions] (
        [Id]                  int            NOT NULL IDENTITY(1,1),
        [CaseId]              int            NOT NULL,
        [CountyId]            int            NOT NULL,
        [Token]               nvarchar(128)  NOT NULL,
        [TokenExpiry]         datetime2      NOT NULL,
        [IsSubmitted]         bit            NOT NULL,
        [SubmittedAt]         datetime2      NULL,
        [FormDataJson]        nvarchar(max)  NULL,
        [DocumentPathsJson]   nvarchar(max)  NULL,
        [IpAddress]           nvarchar(max)  NULL,
        [UserAgent]           nvarchar(max)  NULL,
        [CreatedAt]           datetime2      NOT NULL,
        CONSTRAINT [PK_SarSubmissions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_SarSubmissions_Cases_CaseId]
            FOREIGN KEY ([CaseId]) REFERENCES [Cases] ([Id])
            ON DELETE CASCADE,
        CONSTRAINT [FK_SarSubmissions_Counties_CountyId]
            FOREIGN KEY ([CountyId]) REFERENCES [Counties] ([Id])
            ON DELETE NO ACTION
    );

    CREATE UNIQUE INDEX [IX_SarSubmissions_CaseId]
        ON [SarSubmissions] ([CaseId]);

    CREATE UNIQUE INDEX [IX_SarSubmissions_Token]
        ON [SarSubmissions] ([Token]);

    CREATE INDEX [IX_SarSubmissions_CountyId]
        ON [SarSubmissions] ([CountyId]);

    PRINT 'Table SarSubmissions created.';
END
GO

-- ── 9. Seed: Counties (California FIPS) ──────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM [Counties])
BEGIN
    SET IDENTITY_INSERT [Counties] ON;

    INSERT INTO [Counties] ([Id], [Name], [FipsCode], [IsActive], [CreatedAt]) VALUES
        (1, N'San Diego',      N'06073', 1, '2025-01-01T00:00:00.000'),
        (2, N'Riverside',      N'06065', 1, '2025-01-01T00:00:00.000'),
        (3, N'San Bernardino', N'06071', 1, '2025-01-01T00:00:00.000'),
        (4, N'Fresno',         N'06019', 1, '2025-01-01T00:00:00.000');

    SET IDENTITY_INSERT [Counties] OFF;
    PRINT 'Seed data inserted: 4 counties.';
END
ELSE
    PRINT 'Counties already have data — seed skipped.';
GO

-- ── 10. Mark EF migration as applied ─────────────────────────────────────────
IF NOT EXISTS (
    SELECT 1 FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260319193033_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260319193033_InitialCreate', N'8.0.11');
    PRINT 'Migration 20260319193033_InitialCreate marked as applied.';
END
GO

-- ── Done ──────────────────────────────────────────────────────────────────────
PRINT '';
PRINT '=== Continuum_Dev database setup complete ===';
PRINT 'Tables: Counties, Clients, Workers, Cases, OutreachLogs, SarSubmissions';
PRINT 'Hangfire schema is created automatically when the API starts for the first time.';
PRINT 'Worker/case seed data is inserted by the app on first startup (DatabaseSeeder.cs).';
GO
