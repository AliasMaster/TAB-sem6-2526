using System;

namespace Report.Domain.Entities;

public class CourseSalesResult
{
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public int AccessesSold { get; set; }
    public decimal TotalRevenue { get; set; }
}
