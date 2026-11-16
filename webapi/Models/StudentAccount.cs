using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Platea.Api.Models;

public class StudentAccount
{
    public int Id { get; set; }

    [Required, MaxLength(40)]
    public string StudentId { get; set; } = string.Empty;

    [MaxLength(120)]
    public string FullName { get; set; } = "Campus Student";

    [MaxLength(120)]
    public string Course { get; set; } = string.Empty;

    [Column(TypeName = "decimal(10,2)")]
    public decimal Balance { get; set; } = 890.00m;

    public int LoyaltyPoints { get; set; } = 0;

    public List<LoyaltyTransaction> LoyaltyTransactions { get; set; } = new();
}
