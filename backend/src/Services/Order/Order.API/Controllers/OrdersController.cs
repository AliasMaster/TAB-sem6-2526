using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Order.Application.Common.Interfaces;
using Order.Application.DTOs;

namespace Order.API.Controllers;

[ApiController]
[Route("")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost("purchase")]
    public async Task<IActionResult> Purchase([FromBody] PurchaseRequest request, CancellationToken ct)
    {
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var payment = await _orderService.PurchaseAsync(userId, request, ct);
            return Ok(payment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("process-payment/{paymentId:guid}")]
    public async Task<IActionResult> ProcessPayment([FromRoute] Guid paymentId, CancellationToken ct)
    {
        try
        {
            var payment = await _orderService.ProcessPaymentAsync(paymentId, ct);
            return Ok(payment);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("refund/{id:guid}")]
    public async Task<IActionResult> Refund([FromRoute] Guid id, CancellationToken ct)
    {
        var role = Request.Headers["X-User-Role"].FirstOrDefault();
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();
        Guid? userId = Guid.TryParse(userIdStr, out var parsedId) ? parsedId : null;

        try
        {
            var response = await _orderService.RefundAsync(id, role, userId, ct);
            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyPayments(CancellationToken ct)
    {
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        var payments = await _orderService.GetMyPaymentsAsync(userId, ct);
        return Ok(payments);
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllPayments(CancellationToken ct)
    {
        var role = Request.Headers["X-User-Role"].FirstOrDefault();
        try
        {
            var payments = await _orderService.GetAllPaymentsAsync(role, ct);
            return Ok(payments);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}
