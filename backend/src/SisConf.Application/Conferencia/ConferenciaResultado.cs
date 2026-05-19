namespace SisConf.Application.Conferencia;

public enum ConferenciaResultadoTipo
{
    Ok,
    JaConferido,
    EtiquetaNaoEncontrada,
    StatusInvalido,
    PedidoBloqueado,
    SemPermissao,
    Erro
}

/// <summary>
/// Payload enviado via SignalR ao operador após a conferência processar.
/// O texto TTS já vem pronto pra ser falado pelo browser.
/// </summary>
public record ConferenciaResultado(
    Guid ClientEventId,
    ConferenciaResultadoTipo Tipo,
    string Tts,
    Guid? PedidoId,
    string? Etiqueta,
    Guid? StatusNovoId,
    string? StatusNome,
    string? StatusCor,
    Guid? BoxId,
    string? BoxCodigo,
    string? Cliente,
    string? Descricao,
    string? DetalheErro);
