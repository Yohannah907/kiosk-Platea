using Microsoft.EntityFrameworkCore;
using Platea.Api.Models;

namespace Platea.Api.Data;

public class PlateaDbContext : DbContext
{
    public PlateaDbContext(DbContextOptions<PlateaDbContext> options) : base(options) { }

    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<StudentAccount> StudentAccounts => Set<StudentAccount>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<LoyaltyTransaction> LoyaltyTransactions => Set<LoyaltyTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<MenuItem>().HasIndex(m => m.Slug).IsUnique();
        modelBuilder.Entity<StudentAccount>().HasIndex(s => s.StudentId).IsUnique();
        modelBuilder.Entity<StudentAccount>()
            .Property(s => s.StudentId)
            .HasColumnName("student_id");
        modelBuilder.Entity<StudentAccount>()
            .Property(s => s.FullName)
            .HasColumnName("name");
        modelBuilder.Entity<StudentAccount>()
            .Property(s => s.Course)
            .HasColumnName("course");
        modelBuilder.Entity<StudentAccount>()
            .Property(s => s.Balance)
            .HasColumnName("balance");
        modelBuilder.Entity<StudentAccount>()
            .Property(s => s.LoyaltyPoints)
            .HasColumnName("loyalty_points");
        modelBuilder.Entity<LoyaltyTransaction>()
            .Property(t => t.StudentAccountId)
            .HasColumnName("student_account_id");
        modelBuilder.Entity<LoyaltyTransaction>()
            .Property(t => t.PointsChange)
            .HasColumnName("points_change");
        modelBuilder.Entity<LoyaltyTransaction>()
            .Property(t => t.Type)
            .HasColumnName("transaction_type");
        modelBuilder.Entity<LoyaltyTransaction>()
            .Property(t => t.OrderNumber)
            .HasColumnName("order_number");
        modelBuilder.Entity<LoyaltyTransaction>()
            .Property(t => t.CreatedAt)
            .HasColumnName("created_at");
        modelBuilder.Entity<LoyaltyTransaction>()
            .HasOne(t => t.StudentAccount)
            .WithMany(s => s.LoyaltyTransactions)
            .HasForeignKey(t => t.StudentAccountId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<StudentAccount>().HasData(
            new StudentAccount
            {
                Id = 1,
                StudentId = "2026-0001",
                FullName = "Sample Student",
                Balance = 890.00m,
                LoyaltyPoints = 120
            }
        );

        modelBuilder.Entity<MenuItem>().HasData(
            new MenuItem { Id = 1, Slug = "combo-meal-1", Name = "Combo Meal #1", Price = 99.00m, Category = "Meals", ImageUrl = "/images/combo-meal-1.jpg", Keywords = "fish rice pork squash lunch meal combo", IsAvailable = true },
            new MenuItem { Id = 2, Slug = "sinigang", Name = "Sinigang", Price = 99.00m, Category = "Meals", ImageUrl = "/images/sinigang.jpg", Keywords = "pork soup tamarind broth meal", IsAvailable = true },
            new MenuItem { Id = 3, Slug = "shrimp", Name = "Shrimp", Price = 99.00m, Category = "Meals", ImageUrl = "/images/shrimp.jpg", Keywords = "seafood prawn garlic butter meal", IsAvailable = true },
            new MenuItem { Id = 4, Slug = "ampalaya", Name = "Ampalaya", Price = 99.00m, Category = "Meals", ImageUrl = "/images/ampalaya.jpg", Keywords = "bitter melon egg vegetable meal", IsAvailable = true },
            new MenuItem { Id = 5, Slug = "mango-shake", Name = "Mango Shake", Price = 99.00m, Category = "Drinks", ImageUrl = "/images/mango-shake.jpg", Keywords = "mango juice smoothie fruit drink", IsAvailable = true },
            new MenuItem { Id = 6, Slug = "spaghetti", Name = "Spaghetti", Price = 99.00m, Category = "Meals", ImageUrl = "/images/spaghetti.jpg", Keywords = "pasta noodles meat sauce hotdog meal", IsAvailable = true },
            new MenuItem { Id = 7, Slug = "cinnamon", Name = "Cinnamon", Price = 99.00m, Category = "Snacks", ImageUrl = "/images/cinnamon.jpg", Keywords = "roll pastry bread cinnamon bun sweet", IsAvailable = true },
            new MenuItem { Id = 8, Slug = "champorado", Name = "Champorado", Price = 99.00m, Category = "Meals", ImageUrl = "/images/champorado.jpg", Keywords = "chocolate rice porridge sweet breakfast", IsAvailable = true },
            new MenuItem { Id = 9, Slug = "matcha-latte", Name = "Matcha Latte", Price = 99.00m, Category = "Drinks", ImageUrl = "/images/matcha-latte.jpg", Keywords = "matcha green tea iced milk coffee drink", IsAvailable = true },
            new MenuItem { Id = 10, Slug = "fried-rice", Name = "Fried Rice", Price = 99.00m, Category = "Meals", ImageUrl = "/images/fried-rice.jpg", Keywords = "rice egg vegetable chicken garlic fried rice meal", IsAvailable = true },
            new MenuItem { Id = 11, Slug = "beef-stake", Name = "Beef Stake", Price = 99.00m, Category = "Meals", ImageUrl = "/images/beef-stake.jpg", Keywords = "beef steak bistek onion meat meal", IsAvailable = true },
            new MenuItem { Id = 12, Slug = "biko", Name = "Biko wd Peanuts", Price = 99.00m, Category = "Meals", ImageUrl = "/images/biko.jpg", Keywords = "rice cake sticky peanut kakanin sweet", IsAvailable = true },
            new MenuItem { Id = 13, Slug = "shawarma", Name = "Shawarma", Price = 99.00m, Category = "Snacks", ImageUrl = "/images/shawarma.jpg", Keywords = "wrap beef chicken pita snack", IsAvailable = true },
            new MenuItem { Id = 14, Slug = "burger", Name = "Burger", Price = 99.00m, Category = "Snacks", ImageUrl = "/images/burger.jpg", Keywords = "crispy chicken sandwich cheese lettuce bun snack", IsAvailable = true },
            new MenuItem { Id = 15, Slug = "donuts", Name = "Donuts", Price = 99.00m, Category = "Snacks", ImageUrl = "/images/donuts.jpg", Keywords = "donut doughnut glazed sprinkles sweet snack", IsAvailable = true },
            new MenuItem { Id = 16, Slug = "combo-snacks", Name = "Combo Snacks", Price = 99.00m, Category = "Snacks", ImageUrl = "/images/combo-snacks.jpg", Keywords = "burger fries ketchup chicken snack combo", IsAvailable = true },
            new MenuItem { Id = 17, Slug = "cookies", Name = "Cookies", Price = 99.00m, Category = "Snacks", ImageUrl = "/images/cookies.jpg", Keywords = "cookie chocolate chip baked snack dessert", IsAvailable = true },
            new MenuItem { Id = 18, Slug = "waffle", Name = "Waffle", Price = 99.00m, Category = "Snacks", ImageUrl = "/images/waffle.jpg", Keywords = "strawberry syrup waffle sweet snack", IsAvailable = true },
            new MenuItem { Id = 19, Slug = "macaroons", Name = "Macaroons", Price = 99.00m, Category = "Snacks", ImageUrl = "/images/macaroons.jpg", Keywords = "macaron macarons pastel sweet dessert snack", IsAvailable = true },
            new MenuItem { Id = 20, Slug = "graham-bar", Name = "Graham Bar", Price = 99.00m, Category = "Desserts", ImageUrl = "/images/graham-bar.jpg", Keywords = "ice cream sandwich cookies cream graham dessert", IsAvailable = true },
            new MenuItem { Id = 21, Slug = "oreo-shake", Name = "Oreo Shake", Price = 99.00m, Category = "Desserts", ImageUrl = "/images/oreo-shake.jpg", Keywords = "cookies and cream milkshake whipped dessert", IsAvailable = true },
            new MenuItem { Id = 22, Slug = "halo-halo", Name = "Halo-halo", Price = 99.00m, Category = "Desserts", ImageUrl = "/images/halo-halo.jpg", Keywords = "ube ice shaved pinoy dessert sweet", IsAvailable = true },
            new MenuItem { Id = 23, Slug = "leche-flan", Name = "Leche Flan", Price = 99.00m, Category = "Desserts", ImageUrl = "/images/leche-flan.jpg", Keywords = "flan custard caramel sweet dessert", IsAvailable = true },
            new MenuItem { Id = 24, Slug = "orange-drink", Name = "Orange Drink", Price = 99.00m, Category = "Drinks", ImageUrl = "/images/orange-drink.jpg", Keywords = "juice orange citrus cold iced drink", IsAvailable = true },
            new MenuItem { Id = 25, Slug = "spanish-latte", Name = "Spanish Latte", Price = 99.00m, Category = "Drinks", ImageUrl = "/images/spanish-latte.jpg", Keywords = "coffee iced espresso milk sweet drink", IsAvailable = true },
            new MenuItem { Id = 26, Slug = "hot-americano", Name = "Hot Black Americano", Price = 99.00m, Category = "Drinks", ImageUrl = "/images/hot-americano.jpg", Keywords = "coffee black hot espresso cup drink", IsAvailable = true },
            new MenuItem { Id = 27, Slug = "iced-tea", Name = "Iced Tea", Price = 99.00m, Category = "Drinks", ImageUrl = "/images/iced-tea.jpg", Keywords = "tea lemon mint iced cold drink", IsAvailable = true },
            new MenuItem { Id = 28, Slug = "coca-cola", Name = "Coca Cola", Price = 99.00m, Category = "Drinks", ImageUrl = "/images/coca-cola.jpg", Keywords = "coke soda softdrink cola cold drink", IsAvailable = true },
            new MenuItem { Id = 29, Slug = "calamansi-juice", Name = "Calamansi Juice", Price = 99.00m, Category = "Drinks", ImageUrl = "/images/calamansi-juice.jpg", Keywords = "lime lemon calamansi juice citrus drink", IsAvailable = true },
            new MenuItem { Id = 30, Slug = "white-mocha", Name = "White Mocha", Price = 99.00m, Category = "Drinks", ImageUrl = "/images/white-mocha.jpg", Keywords = "coffee chocolate iced whipped caramel drink", IsAvailable = true }
        );
    }
}
