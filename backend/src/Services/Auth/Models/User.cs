using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models
{
    [Table("users", Schema = "auth")]
    public class User
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("login")]
        public string Login { get; set; }

        // DODANA KOLUMNA EMAIL
        [Column("email")]
        public string? Email { get; set; } // Znak zapytania oznacza, że może być nullem

        // DODANA KOLUMNA PROFILE PIC
        [Column("profile_pic")]
        public string? ProfilePic { get; set; }

        [Required]
        [Column("password_hash")]
        public string PasswordHash { get; set; }

        [Required]
        [Column("role")]
        public string Role { get; set; } 
    }
}