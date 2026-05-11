using CatalogService.Models;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.Data;

public class CatalogDbContext : DbContext
{
    public CatalogDbContext(DbContextOptions<CatalogDbContext> options) : base(options)
    {
    }

    public DbSet<Course> Courses { get; set; }
    public DbSet<CourseMaterial> CourseMaterials { get; set; }
    public DbSet<CourseAccess> CourseAccesses { get; set; }
    public DbSet<Enrollment> Enrollments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasPostgresEnum<CourseStatus>("course_status");
        modelBuilder.HasPostgresEnum<EnrollmentStatus>("enrollment_status");

        modelBuilder.Entity<Enrollment>(entity =>
        {
            entity.ToTable("enrollments", "enrollment");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.CourseId).HasColumnName("course_id");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.EnrolledAt).HasColumnName("enrolled_at");
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.ToTable("courses", "catalog");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AuthorId).HasColumnName("author_id");
            entity.Property(e => e.Title).HasColumnName("title");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Price).HasColumnName("price");
            entity.Property(e => e.ImageUrl).HasColumnName("image_url");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<CourseMaterial>(entity =>
        {
            entity.ToTable("lessons", "catalog"); // W init-db.sh tabela nazywa się lessons
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CourseId).HasColumnName("course_id");
            entity.Property(e => e.Title).HasColumnName("title");
            entity.Property(e => e.ContentUrl).HasColumnName("content_url");
            entity.Property(e => e.Order).HasColumnName("order_index");
        });

        modelBuilder.Entity<CourseAccess>(entity =>
        {
            entity.ToTable("course_accesses", "catalog"); // Powinna być taka tabela? Sprawdźmy init-db
            entity.HasKey(ca => new { ca.UserId, ca.CourseId });
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.CourseId).HasColumnName("course_id");
            entity.Property(e => e.GrantedAt).HasColumnName("granted_at");
        });
    }
}

