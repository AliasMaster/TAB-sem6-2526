using Microsoft.EntityFrameworkCore;
using CommunityService.Domain.Entities;

namespace CommunityService.Infrastructure.Persistence;

public class CommunityDbContext : DbContext
{
    public CommunityDbContext(DbContextOptions<CommunityDbContext> options) : base(options)
    {
    }

    public DbSet<CommunityService.Domain.Entities.Thread> Threads => Set<CommunityService.Domain.Entities.Thread>();
    public DbSet<Post> Posts => Set<Post>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<CommunityService.Domain.Entities.Thread>(entity =>
        {
            entity.ToTable("threads", "community");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Title).HasColumnName("title");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.AuthorId).HasColumnName("author_id");
            entity.Property(e => e.Category).HasColumnName("category");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasOne(t => t.Author)
                .WithMany()
                .HasForeignKey(t => t.AuthorId);
        });

        modelBuilder.Entity<Post>(entity =>
        {
            entity.ToTable("posts", "community");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ThreadId).HasColumnName("thread_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.AuthorId).HasColumnName("author_id");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasOne(p => p.Thread)
                .WithMany(t => t.Posts)
                .HasForeignKey(p => p.ThreadId);

            entity.HasOne(p => p.Author)
                .WithMany()
                .HasForeignKey(p => p.AuthorId);
        });

        modelBuilder.Entity<AuthUser>(entity =>
        {
            entity.ToTable("users", "auth");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Login).HasColumnName("login");
        });
    }
}
