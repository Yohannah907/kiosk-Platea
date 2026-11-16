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

    [Column(TypeName = "decimal(10,2)")]
    public decimal Balance { get; set; } = 890.00m;

    public int RewardsPoints { get; set; } = 0;
}
