using System;
using System.Collections.Generic;

using Auth.Domain.Enums;

namespace Auth.Domain.Entities;

public partial class User
{
    public Guid Id { get; set; }

    public string Login { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public UserRole Role { get; set; }
}
