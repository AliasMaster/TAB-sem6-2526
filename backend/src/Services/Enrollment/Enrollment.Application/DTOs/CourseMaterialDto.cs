using System;

namespace EnrollmentService.Application.DTOs;

public record CourseMaterialDto(Guid Id, string Title, string ContentUrl, int Order);
