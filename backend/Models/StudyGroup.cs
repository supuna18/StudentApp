namespace StudentApp.Api.Models;

public class StudyGroup
{
    public string? Id { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string CreatedByEmail { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string JoinCode { get; set; } = string.Empty;
    public List<MemberDetail> Members { get; set; } = new();
}

public class MemberDetail {
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; } // Indha line irukkannu confirm pannunga
}
// Controller-la irundhu delete panna matha classes-ah inga vachukonga
public class JoinRequest {
    public string Email { get; set; } = string.Empty;
    public string JoinCode { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
}

public class UpdateRequest {
    public string GroupName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
}

public class LeaveRequest {
    public string GroupId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}