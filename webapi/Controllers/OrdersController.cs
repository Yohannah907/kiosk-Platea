using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platea.Api.Data;
using Platea.Api.Models;

namespace Platea.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly PlateaDbContext _db;

    public OrdersController(PlateaDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
    {
        var orders = await _db.Orders
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
        return Ok(orders);
    }

    public record CreateOrderRequest(
        string StudentId,
        string PaymentMethod,
        List<CreateOrderItemDto> Items
    );

    public record CreateOrderItemDto(
        string ItemSlug,
        string ItemName,
        int Quantity,
        decimal UnitPrice
    );

    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(CreateOrderRequest request)
    {
        if (request.Items is null || request.Items.Count == 0)
            return BadRequest("Order must contain at least one item.");

        var subtotal = request.Items.Sum(i => i.UnitPrice * i.Quantity);
        var count = await _db.Orders.CountAsync() + 1;

        var order = new Order
        {
            OrderNumber = $"#PLT-{count:D3}",
            StudentId = string.IsNullOrWhiteSpace(request.StudentId) ? "Guest" : request.StudentId,
            PaymentMethod = request.PaymentMethod,
            Subtotal = subtotal,
            AdditionalFees = 0m,
            Total = subtotal,
            Status = "Confirmed",
            Items = request.Items.Select(i => new OrderItem
            {
                ItemSlug = i.ItemSlug,
                ItemName = i.ItemName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList()
        };

        if (request.PaymentMethod != "Cash" && !string.IsNullOrWhiteSpace(request.StudentId))
        {
            var student = await _db.StudentAccounts.FirstOrDefaultAsync(s => s.StudentId == request.StudentId);
            if (student is not null && student.Balance >= subtotal)
            {
                student.Balance -= subtotal;
                student.RewardsPoints += (int)(subtotal / 10);
            }
        }

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOrders), new { id = order.Id }, order);
    }

    public record UpdateStatusRequest(string Status);

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateStatusRequest request)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order is null) return NotFound();

        order.Status = request.Status;
        await _db.SaveChangesAsync();
        return Ok(order);
    }
}
