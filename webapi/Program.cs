using Microsoft.EntityFrameworkCore;
using Platea.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<PlateaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("ViteFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PlateaDbContext>();
    db.Database.EnsureCreated();
    db.Database.ExecuteSqlRaw("""
        IF COL_LENGTH('dbo.StudentAccounts', 'student_id') IS NULL
            AND COL_LENGTH('dbo.StudentAccounts', 'StudentId') IS NOT NULL
            EXEC sp_rename 'dbo.StudentAccounts.StudentId', 'student_id', 'COLUMN';
        IF COL_LENGTH('dbo.StudentAccounts', 'name') IS NULL
            AND COL_LENGTH('dbo.StudentAccounts', 'FullName') IS NOT NULL
            EXEC sp_rename 'dbo.StudentAccounts.FullName', 'name', 'COLUMN';
        IF COL_LENGTH('dbo.StudentAccounts', 'balance') IS NULL
            AND COL_LENGTH('dbo.StudentAccounts', 'Balance') IS NOT NULL
            EXEC sp_rename 'dbo.StudentAccounts.Balance', 'balance', 'COLUMN';
        IF COL_LENGTH('dbo.StudentAccounts', 'loyalty_points') IS NULL
            AND COL_LENGTH('dbo.StudentAccounts', 'RewardsPoints') IS NOT NULL
            EXEC sp_rename 'dbo.StudentAccounts.RewardsPoints', 'loyalty_points', 'COLUMN';
        IF COL_LENGTH('dbo.StudentAccounts', 'course') IS NULL
            ALTER TABLE dbo.StudentAccounts ADD course nvarchar(120) NOT NULL
                CONSTRAINT DF_StudentAccounts_course DEFAULT '';

        IF OBJECT_ID('dbo.LoyaltyTransactions', 'U') IS NULL
        BEGIN
            CREATE TABLE dbo.LoyaltyTransactions (
                Id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
                student_account_id int NOT NULL,
                points_change int NOT NULL,
                transaction_type nvarchar(20) NOT NULL,
                Description nvarchar(240) NOT NULL,
                order_number nvarchar(30) NULL,
                created_at datetime2 NOT NULL,
                CONSTRAINT FK_LoyaltyTransactions_StudentAccounts
                    FOREIGN KEY (student_account_id) REFERENCES dbo.StudentAccounts(Id)
                    ON DELETE CASCADE
            );
            CREATE INDEX IX_LoyaltyTransactions_StudentAccountId_CreatedAt
                ON dbo.LoyaltyTransactions(student_account_id, created_at);
        END
        """);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("ViteFrontend");
app.MapControllers();
app.Run();
