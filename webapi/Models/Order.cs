using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Platea.Api.Models;

public class Order
{
    public int Id { get; set; }

    [Required, MaxLength(30)]
    public string OrderNumber { get; set; } = string.Empty;

    [MaxLength(40)]
    public string StudentId { get; set; } = "Guest";

    [Required, MaxLength(30)]
    public string PaymentMethod { get; set; } = "Cash";

    [Column(TypeName = "decimal(10,2)")]
    public decimal Subtotal { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal AdditionalFees { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal Total { get; set; }

    [Required, MaxLength(30)]
    public string Status { get; set; } = "Confirmed";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<OrderItem> Items { get; set; } = new();
}

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string ItemSlug { get; set; } = string.Empty;
    public string ItemName { get; set; } = string.Empty;
    public int Quantity { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal UnitPrice { get; set; }
}
