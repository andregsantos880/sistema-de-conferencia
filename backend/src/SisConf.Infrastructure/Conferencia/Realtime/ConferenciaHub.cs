using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SisConf.Application.Common.Tenants;

namespace SisConf.Infrastructure.Conferencia.Realtime;

[Authorize]
public class ConferenciaHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var ctx = Context.GetHttpContext()?.RequestServices.GetService(typeof(ITenantContext)) as ITenantContext;
        if (ctx is not null && ctx.EstaAutenticado)
        {
            // Cada usuário tem seu próprio "grupo" — facilita push direto pelo UsuarioId
            await Groups.AddToGroupAsync(Context.ConnectionId, GrupoDoUsuario(ctx.UsuarioId));
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var ctx = Context.GetHttpContext()?.RequestServices.GetService(typeof(ITenantContext)) as ITenantContext;
        if (ctx is not null && ctx.EstaAutenticado)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, GrupoDoUsuario(ctx.UsuarioId));
        }
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>Cliente chama Ping pra registrar a connectionId no servidor.</summary>
    public Task<string> Ping() => Task.FromResult(Context.ConnectionId);

    public static string GrupoDoUsuario(Guid usuarioId) => $"u:{usuarioId}";
}
