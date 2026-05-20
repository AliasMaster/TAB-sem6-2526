namespace Shared.Events;

public record VideoProcessingStartedEvent(Guid JobId);
public record VideoProcessingProgressEvent(Guid JobId, int Progress);
public record VideoProcessingCompletedEvent(Guid JobId, string HlsUrl, Guid LessonId);
public record VideoProcessingFailedEvent(Guid JobId, string Error);
