using Microsoft.EntityFrameworkCore;
using CatalogService.Domain.Entities;
using CatalogService.Domain.Enums;

namespace CatalogService.Infrastructure.Persistence;

public class CatalogDbContext : DbContext
{
    public CatalogDbContext(DbContextOptions<CatalogDbContext> options) : base(options)
    {
    }

    public DbSet<Course> Courses { get; set; }
    public DbSet<CourseMaterial> CourseMaterials { get; set; }
    public DbSet<CourseAccess> CourseAccesses { get; set; }
    public DbSet<Review> Reviews { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasPostgresEnum<CourseStatus>("course_status");

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
            entity.Property(e => e.IsBlocked).HasColumnName("is_blocked");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.ToTable("reviews", "catalog");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.CourseId).HasColumnName("course_id");
            entity.Property(e => e.Rating).HasColumnName("rating");
            entity.Property(e => e.Comment).HasColumnName("comment");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<CourseMaterial>(entity =>
        {
            entity.ToTable("lessons", "catalog");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CourseId).HasColumnName("course_id");
            entity.Property(e => e.Title).HasColumnName("title");
            entity.Property(e => e.ContentUrl).HasColumnName("content_url");
            entity.Property(e => e.Order).HasColumnName("order_index");
        });

        modelBuilder.Entity<CourseAccess>(entity =>
        {
            entity.ToTable("course_accesses", "catalog");
            entity.HasKey(ca => new { ca.UserId, ca.CourseId });
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.CourseId).HasColumnName("course_id");
            entity.Property(e => e.GrantedAt).HasColumnName("granted_at");
        });
    }
}
