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

    [HttpGet("{studentId}")]
    public async Task<ActionResult<StudentAccount>> GetOrCreateStudent(string studentId)
    {
        var account = await _db.StudentAccounts.FirstOrDefaultAsync(s => s.StudentId == studentId);
        if (account is null)
        {
            account = new StudentAccount
            {
                StudentId = studentId,
                FullName = $"Student {studentId}",
                Balance = 890.00m,
                RewardsPoints = 0
            };
            _db.StudentAccounts.Add(account);
            await _db.SaveChangesAsync();
        }
        return Ok(account);
    }
}
