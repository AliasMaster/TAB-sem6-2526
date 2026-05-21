using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CommunityService.Domain.Entities;
using CommunityService.Infrastructure.Persistence;

namespace CommunityService.API.Controllers;

[ApiController]
[Route("threads")]
public class ThreadsController : ControllerBase
{
    private readonly CommunityDbContext _db;

    public ThreadsController(CommunityDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetThreads(CancellationToken ct)
    {
        var threads = await _db.Threads
            .Include(t => t.Author)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(ct);

        var result = threads.Select(t => new { 
                t.Id, 
                t.Title, 
                t.Category, 
                t.AuthorId, 
                AuthorName = t.Author != null ? t.Author.Login : "Nieznany", 
                t.CreatedAt 
            });

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetThread([FromRoute] Guid id, CancellationToken ct)
    {
        var thread = await _db.Threads
            .Include(t => t.Author)
            .Include(t => t.Posts)
                .ThenInclude(p => p.Author)
            .FirstOrDefaultAsync(t => t.Id == id, ct);

        if (thread == null) return NotFound();

        var result = new
        {
            thread.Id,
            thread.Title,
            thread.Content,
            thread.Category,
            thread.AuthorId,
            AuthorName = thread.Author != null ? thread.Author.Login : "Nieznany",
            thread.CreatedAt,
            Posts = thread.Posts.OrderBy(p => p.CreatedAt).Select(p => new
            {
                p.Id,
                p.Content,
                p.AuthorId,
                AuthorName = p.Author != null ? p.Author.Login : "Nieznany",
                p.CreatedAt
            })
        };

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateThread([FromBody] CreateThreadRequest request, CancellationToken ct)
    {
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();
        if (!Guid.TryParse(userIdStr, out var userId)) return Unauthorized();

        var thread = new CommunityService.Domain.Entities.Thread
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Content = request.Content,
            Category = request.Category,
            AuthorId = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _db.Threads.AddAsync(thread, ct);
        await _db.SaveChangesAsync(ct);

        return Created($"/threads/{thread.Id}", new { thread.Id, thread.Title, thread.Content, thread.Category, thread.AuthorId, thread.CreatedAt });
    }

    [HttpPost("{id:guid}/posts")]
    public async Task<IActionResult> AddPost([FromRoute] Guid id, [FromBody] CreatePostRequest request, CancellationToken ct)
    {
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();
        if (!Guid.TryParse(userIdStr, out var userId)) return Unauthorized();

        var thread = await _db.Threads.FindAsync(new object[] { id }, ct);
        if (thread == null) return NotFound();

        var post = new Post
        {
            Id = Guid.NewGuid(),
            ThreadId = id,
            Content = request.Content,
            AuthorId = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _db.Posts.AddAsync(post, ct);
        await _db.SaveChangesAsync(ct);

        return Created($"/threads/{id}/posts/{post.Id}", new { post.Id, post.Content, post.AuthorId, post.CreatedAt });
    }
}

public record CreateThreadRequest(string Title, string Content, CommunityService.Domain.Enums.ThreadCategory Category);
public record CreatePostRequest(string Content);
