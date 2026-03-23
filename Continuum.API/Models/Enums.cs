namespace Continuum.API.Models;

public enum CaseStatus
{
    Active,
    PendingSubmission,
    Submitted,
    Terminated,
    Reinstated
}

public enum UrgencyLevel
{
    Green,   // 15+ days until due
    Yellow,  // 8-14 days until due
    Red      // 0-7 days until due or overdue
}

public enum OutreachChannel
{
    Sms,
    Email
}

public enum OutreachStatus
{
    Pending,
    Sent,
    Delivered,
    Failed,
    Opened,
    Clicked
}

public enum WorkerRole
{
    Worker,
    Supervisor,
    Admin
}
