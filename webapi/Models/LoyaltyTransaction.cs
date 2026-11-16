using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Platea.Api.Models;

public class LoyaltyTransaction
{
    public int Id { get; set; }
    public int StudentAccountId { get; set; }
    public StudentAccount StudentAccount { get; set; } = null!;

    public int PointsChange { get; set; }

    [Required, MaxLength(20)]
    public string Type { get; set; } = string.Empty;

    [Required, MaxLength(240)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(30)]
    public string? OrderNumber { get; set; }

    [Column(TypeName = "datetime2")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
