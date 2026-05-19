using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SisConf.Application.Common.Tenants;

namespace SisConf.Infrastructure.Importacao.Realtime;

[Authorize]
public class ImportacaoHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var ctx = Context.GetHttpContext()?.RequestServices.GetService(typeof(ITenantContext)) as ITenantContext;
        if (ctx is not null && ctx.EstaAutenticado)
            await Groups.AddToGroupAsync(Context.ConnectionId, GrupoDoUsuario(ctx.UsuarioId));
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var ctx = Context.GetHttpContext()?.RequestServices.GetService(typeof(ITenantContext)) as ITenantContext;
        if (ctx is not null && ctx.EstaAutenticado)
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, GrupoDoUsuario(ctx.UsuarioId));
        await base.OnDisconnectedAsync(exception);
    }

    public static string GrupoDoUsuario(Guid usuarioId) => $"imp:u:{usuarioId}";
}
