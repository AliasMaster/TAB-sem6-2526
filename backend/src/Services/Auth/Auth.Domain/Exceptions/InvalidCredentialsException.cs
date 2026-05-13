namespace Auth.Domain.Exceptions;

public class InvalidCredentialsException : Exception
{
    public InvalidCredentialsException() : base("Invalid credentials provided.")
    {
        
    }
}