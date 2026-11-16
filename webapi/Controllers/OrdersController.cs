using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platea.Api.Data;
using Platea.Api.Models;

namespace Platea.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private static readonly HashSet<string> HappyHourItems =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "shawarma", "burger", "donuts", "combo-snacks", "cookies",
            "waffle", "macaroons", "biko", "graham-bar", "oreo-shake",
            "halo-halo", "leche-flan", "cinnamon", "champorado",
            "spanish-latte", "hot-americano", "matcha-latte", "white-mocha",
        };

    private static readonly HashSet<string> DrinkItems =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "orange-drink", "mango-shake", "spanish-latte", "hot-americano",
            "iced-tea", "coca-cola", "calamansi-juice", "white-mocha",
            "matcha-latte",
        };

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
        string StudentName,
        string Course,
        decimal InitialBalance,
        string PaymentMethod,
        bool HappyHour,
        bool ByoTumbler,
        List<CreateOrderItemDto> Items
    );

    public record CreateOrderItemDto(
        string ItemSlug,
        string ItemName,
        int Quantity,
        decimal UnitPrice
    );

    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateOrderRequest request)
    {
        if (request.Items is null || request.Items.Count == 0)
            return BadRequest("Order must contain at least one item.");
        if (request.Items.Any(i => i.Quantity <= 0 || i.UnitPrice < 0))
            return BadRequest("Order items must have a positive quantity and non-negative price.");
        if (request.PaymentMethod is not ("Cash" or "GCash" or "PayMaya" or "Loyalty Points"))
            return BadRequest("Unsupported payment method.");

        var studentId = request.StudentId?.Trim() ?? string.Empty;
        var paidTotal = request.Items.Sum(i => i.UnitPrice * i.Quantity);

        await using var transaction = await _db.Database.BeginTransactionAsync();
        StudentAccount? student = null;
        if (!string.IsNullOrWhiteSpace(studentId) && studentId != "Guest")
        {
            student = await _db.StudentAccounts
                .FirstOrDefaultAsync(s => s.StudentId == studentId);
            if (student is null)
            {
                if (request.InitialBalance < 0 ||
                    string.IsNullOrWhiteSpace(request.StudentName))
                    return BadRequest("Student details are required to register this student.");

                student = new StudentAccount
                {
                    StudentId = studentId,
                    FullName = request.StudentName.Trim(),
                    Course = request.Course?.Trim() ?? string.Empty,
                    Balance = request.InitialBalance,
                };
                _db.StudentAccounts.Add(student);
            }
        }

        var pointsRedeemed = request.PaymentMethod == "Loyalty Points"
            ? (int)decimal.Ceiling(paidTotal * 10m)
            : 0;
        if (request.PaymentMethod == "Loyalty Points" &&
            (student is null || student.LoyaltyPoints < pointsRedeemed))
        {
            return BadRequest("The student does not have enough loyalty points to cover this order.");
        }

        var happyHourActive = request.HappyHour &&
            DateTime.Now.TimeOfDay >= TimeSpan.FromHours(14) &&
            DateTime.Now.TimeOfDay <= new TimeSpan(16, 30, 0);
        var basePoints = paidTotal >= 40m && request.PaymentMethod != "Loyalty Points"
            ? (int)decimal.Floor(paidTotal / 20m)
            : 0;
        var happyHourSpend = happyHourActive &&
            request.PaymentMethod != "Loyalty Points"
            ? request.Items
                .Where(i => HappyHourItems.Contains(i.ItemSlug))
                .Sum(i => i.UnitPrice * i.Quantity)
            : 0m;
        var happyHourPoints = (int)decimal.Floor(happyHourSpend / 20m);
        var tumblerPoints = request.PaymentMethod != "Loyalty Points" &&
            request.ByoTumbler &&
            request.Items.Any(i => DrinkItems.Contains(i.ItemSlug))
                ? 2
                : 0;
        var pointsEarned = paidTotal >= 40m
            ? basePoints + happyHourPoints + tumblerPoints
            : 0;
        var orderCount = await _db.Orders.CountAsync();
        var order = new Order
        {
            OrderNumber = $"#PLT-{orderCount + 1:D3}",
            StudentId = studentId.Length == 0 ? "Guest" : studentId,
            PaymentMethod = request.PaymentMethod,
            Subtotal = paidTotal,
            AdditionalFees = 0m,
            Total = paidTotal,
            Status = "Confirmed",
            Items = request.Items.Select(i => new OrderItem
            {
                ItemSlug = i.ItemSlug,
                ItemName = i.ItemName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
            }).ToList(),
        };

        if (student is not null)
        {
            if (pointsRedeemed > 0)
            {
                student.LoyaltyPoints -= pointsRedeemed;
                _db.LoyaltyTransactions.Add(new LoyaltyTransaction
                {
                    StudentAccount = student,
                    PointsChange = -pointsRedeemed,
                    Type = "Redeemed",
                    Description = $"Paid order with loyalty points (₱{paidTotal:0.00} value)",
                    OrderNumber = order.OrderNumber,
                });
            }

            if (pointsEarned > 0)
            {
                student.LoyaltyPoints += pointsEarned;
                _db.LoyaltyTransactions.Add(new LoyaltyTransaction
                {
                    StudentAccount = student,
                    PointsChange = pointsEarned,
                    Type = "Earned",
                    Description = $"Order payment ₱{paidTotal:0.00}",
                    OrderNumber = order.OrderNumber,
                });
            }
        }

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        var studentResponse = student is null
            ? null
            : new
            {
                student.StudentId,
                Name = student.FullName,
                student.Course,
                student.Balance,
                LoyaltyPoints = student.LoyaltyPoints,
            };
        return CreatedAtAction(nameof(GetOrders), new { id = order.Id }, new
        {
            Order = order,
            PointsEarned = pointsEarned,
            PointsRedeemed = pointsRedeemed,
            Student = studentResponse,
        });
    }

    public record UpdateStatusRequest(string Status);

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateStatusRequest request)
    {
        if (request.Status is not ("Confirmed" or "Preparing" or "Ready" or "Completed"))
            return BadRequest("Unsupported order status.");

        var order = await _db.Orders.FindAsync(id);
        if (order is null) return NotFound();

        order.Status = request.Status;
        await _db.SaveChangesAsync();
        return Ok(order);
    }
}
