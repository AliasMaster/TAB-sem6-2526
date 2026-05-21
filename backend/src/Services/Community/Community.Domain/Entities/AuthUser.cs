using System;

namespace CommunityService.Domain.Entities;

public class AuthUser
{
    public Guid Id { get; set; }
    public string Login { get; set; } = string.Empty;
}
