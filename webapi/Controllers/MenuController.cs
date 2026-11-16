using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platea.Api.Data;
using Platea.Api.Models;

namespace Platea.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    private readonly PlateaDbContext _db;

    public MenuController(PlateaDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MenuItem>>> GetAll([FromQuery] string? category, [FromQuery] string? search)
    {
        var query = _db.MenuItems.AsQueryable();

        if (!string.IsNullOrWhiteSpace(category) && category != "All Items")
        {
            query = query.Where(m => m.Category == category);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(m =>
                m.Name.ToLower().Contains(term) ||
                m.Keywords.ToLower().Contains(term) ||
                m.Category.ToLower().Contains(term));
        }

        return Ok(await query.OrderBy(m => m.Id).ToListAsync());
    }

    [HttpPost]
    public async Task<ActionResult<MenuItem>> Create(MenuItem item)
    {
        if (string.IsNullOrWhiteSpace(item.Slug))
        {
            item.Slug = item.Name.ToLower().Replace(" ", "-");
        }
        _db.MenuItems.Add(item);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = item.Id }, item);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, MenuItem updated)
    {
        var existing = await _db.MenuItems.FindAsync(id);
        if (existing is null) return NotFound();

        existing.Name = updated.Name;
        existing.Price = updated.Price;
        existing.Category = updated.Category;
        existing.Keywords = updated.Keywords;
        existing.IsAvailable = updated.IsAvailable;
        if (!string.IsNullOrWhiteSpace(updated.ImageUrl))
        {
            existing.ImageUrl = updated.ImageUrl;
        }

        await _db.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _db.MenuItems.FindAsync(id);
        if (existing is null) return NotFound();

        _db.MenuItems.Remove(existing);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
