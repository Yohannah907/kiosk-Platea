using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platea.Api.Data;
using Platea.Api.Models;

namespace Platea.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly PlateaDbContext _db;

    public StudentsController(PlateaDbContext db)
    {
        _db = db;
    }

    public record RegisterStudentRequest(
        string StudentId,
        string Name,
        string Course,
        decimal InitialBalance
    );

    public record StudentResponse(
        string StudentId,
        string Name,
        string Course,
        decimal Balance,
        int LoyaltyPoints
    );

    public record LoyaltyTransactionResponse(
        int Id,
        string StudentId,
        int PointsChange,
        string Type,
        string Description,
        string? OrderNumber,
        DateTime CreatedAt
    );

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StudentResponse>>> GetStudents()
    {
        var students = await _db.StudentAccounts
            .OrderBy(s => s.StudentId)
            .Select(s => new StudentResponse(
                s.StudentId, s.FullName, s.Course, s.Balance, s.LoyaltyPoints))
            .ToListAsync();
        return Ok(students);
    }

    [HttpGet("{studentId}")]
    public async Task<ActionResult<StudentResponse>> GetStudent(string studentId)
    {
        var student = await _db.StudentAccounts
            .Where(s => s.StudentId == studentId)
            .Select(s => new StudentResponse(
                s.StudentId, s.FullName, s.Course, s.Balance, s.LoyaltyPoints))
            .FirstOrDefaultAsync();
        return student is null ? NotFound() : Ok(student);
    }

    [HttpPost]
    public async Task<ActionResult<StudentResponse>> RegisterStudent(
        RegisterStudentRequest request)
    {
        var studentId = request.StudentId.Trim();
        if (string.IsNullOrWhiteSpace(studentId) ||
            string.IsNullOrWhiteSpace(request.Name) ||
            request.InitialBalance < 0)
        {
            return BadRequest("Student ID, name, and a non-negative initial balance are required.");
        }

        var student = await _db.StudentAccounts
            .FirstOrDefaultAsync(s => s.StudentId == studentId);
        if (student is null)
        {
            student = new StudentAccount
            {
                StudentId = studentId,
                FullName = request.Name.Trim(),
                Course = request.Course.Trim(),
                Balance = request.InitialBalance,
            };
            _db.StudentAccounts.Add(student);
        }
        else
        {
            student.FullName = request.Name.Trim();
            student.Course = request.Course.Trim();
        }

        await _db.SaveChangesAsync();
        return Ok(ToResponse(student));
    }

    [HttpGet("{studentId}/transactions")]
    public async Task<ActionResult<IEnumerable<LoyaltyTransactionResponse>>> GetTransactions(
        string studentId)
    {
        var transactions = await _db.LoyaltyTransactions
            .Where(t => t.StudentAccount.StudentId == studentId)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new LoyaltyTransactionResponse(
                t.Id,
                t.StudentAccount.StudentId,
                t.PointsChange,
                t.Type,
                t.Description,
                t.OrderNumber,
                t.CreatedAt))
            .ToListAsync();
        return Ok(transactions);
    }

    [HttpGet("transactions")]
    public async Task<ActionResult<IEnumerable<LoyaltyTransactionResponse>>> GetAllTransactions()
    {
        var transactions = await _db.LoyaltyTransactions
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new LoyaltyTransactionResponse(
                t.Id,
                t.StudentAccount.StudentId,
                t.PointsChange,
                t.Type,
                t.Description,
                t.OrderNumber,
                t.CreatedAt))
            .ToListAsync();
        return Ok(transactions);
    }

    [HttpPost("reset-semester-points")]
    public async Task<ActionResult<IEnumerable<StudentResponse>>> ResetSemesterPoints()
    {
        var students = await _db.StudentAccounts.ToListAsync();
        foreach (var student in students)
        {
            if (student.LoyaltyPoints <= 0) continue;
            _db.LoyaltyTransactions.Add(new LoyaltyTransaction
            {
                StudentAccount = student,
                PointsChange = -student.LoyaltyPoints,
                Type = "Reset",
                Description = "Semester loyalty points reset",
            });
            student.LoyaltyPoints = 0;
        }

        await _db.SaveChangesAsync();
        return Ok(students.Select(ToResponse));
    }

    private static StudentResponse ToResponse(StudentAccount student) =>
        new(student.StudentId, student.FullName, student.Course,
            student.Balance, student.LoyaltyPoints);
}
