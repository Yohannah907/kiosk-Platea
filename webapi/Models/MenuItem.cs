using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Platea.Api.Models;

public class MenuItem
{
    public int Id { get; set; }

    [Required, MaxLength(80)]
    public string Slug { get; set; } = string.Empty;

    [Required, MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [Column(TypeName = "decimal(10,2)")]
    public decimal Price { get; set; }

    [Required, MaxLength(40)]
    public string Category { get; set; } = "Meals";

    [MaxLength(260)]
    public string ImageUrl { get; set; } = string.Empty;

    [MaxLength(260)]
    public string Keywords { get; set; } = string.Empty;

    public bool IsAvailable { get; set; } = true;
}
