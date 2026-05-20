using Microsoft.EntityFrameworkCore;
using EnrollmentService.Domain.Entities;
using EnrollmentService.Domain.Enums;

namespace EnrollmentService.Infrastructure.Persistence;

public class EnrollmentDbContext : DbContext
{
    public EnrollmentDbContext(DbContextOptions<EnrollmentDbContext> options) : base(options)
    {
    }

    public DbSet<Domain.Entities.Enrollment> Enrollments => Set<Domain.Entities.Enrollment>();
    public DbSet<Progress> Progresses => Set<Progress>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasPostgresEnum<EnrollmentStatus>("enrollment_status");

        modelBuilder.Entity<Domain.Entities.Enrollment>(entity =>
        {
            entity.ToTable("enrollments", "enrollment");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.CourseId).HasColumnName("course_id");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.EnrolledAt).HasColumnName("enrolled_at");
        });

        modelBuilder.Entity<Progress>(entity =>
        {
            entity.ToTable("progress", "catalog");
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Id).HasColumnName("id");
            entity.Property(p => p.UserId).HasColumnName("user_id");
            entity.Property(p => p.LessonId).HasColumnName("lesson_id");
            entity.Property(p => p.IsCompleted).HasColumnName("is_completed");
            entity.Property(p => p.LastAccessed).HasColumnName("last_accessed");
        });
    }
}
