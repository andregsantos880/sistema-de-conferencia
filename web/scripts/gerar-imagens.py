"""Gera as imagens de divulgação do SysConf (Pillow).

Rodar de dentro de web/:  python scripts/gerar-imagens.py

Entradas  : public/imagens/tela-*.png  (capturas reais do app)
Saídas    : public/imagens/og.png, post-quadrado.png, post-largo.png
            public/imagens/icone-512.png, icone-192.png, icone-180.png

Nada aqui usa banco de imagens: o fundo é gerado e as telas são do próprio
produto. Ao trocar uma imagem publicada, mude o NOME do arquivo (o Firebase
serve imagem com cache de 1 ano).
"""
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
PASTA = RAIZ / "public" / "imagens"          # og, posts e ícones (servidos de /imagens)
PASTA_TELAS = RAIZ / "src" / "imagens"      # capturas do app (importadas pelo Vite, com hash)

# Paleta igual à do sistema (Tailwind: slate/emerald)
FUNDO_TOPO = (15, 23, 42)      # slate-900  #0f172a
FUNDO_BASE = (30, 41, 59)      # slate-800  #1e293b
VERDE = (5, 150, 105)          # emerald-600 #059669
VERDE_CLARO = (52, 211, 153)   # emerald-400 #34d399
BRANCO = (255, 255, 255)
CINZA_CLARO = (203, 213, 225)  # slate-300
CINZA_MEDIO = (148, 163, 184)  # slate-400

FONTE_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONTE_NORMAL = "C:/Windows/Fonts/segoeui.ttf"

TITULO = "Sua conferência de cargas inteira no navegador"
BULLETS = [
    "Importe o arquivo da fábrica e bipe as etiquetas",
    "Box, peça e quantidade na tela a cada leitura",
    "Conferência, saída e entrega com contador por estágio",
]
SELO = "30 dias grátis  •  sem cartão de crédito"
ASSINATURA = "sysconf-web.web.app"


def fonte(caminho: str, tamanho: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(caminho, tamanho)
    except OSError:
        return ImageFont.load_default(tamanho)


def fundo(largura: int, altura: int) -> Image.Image:
    """Gradiente vertical simples, escuro como o topo do site."""
    imagem = Image.new("RGB", (largura, altura), FUNDO_TOPO)
    desenho = ImageDraw.Draw(imagem)
    for y in range(altura):
        t = y / max(altura - 1, 1)
        cor = tuple(round(FUNDO_TOPO[i] + (FUNDO_BASE[i] - FUNDO_TOPO[i]) * t) for i in range(3))
        desenho.line([(0, y), (largura, y)], fill=cor)
    return imagem


def marca(desenho: ImageDraw.ImageDraw, x: int, y: int, lado: int) -> None:
    """Quadrado verde com o S (igual ao logo do cabeçalho do app)."""
    desenho.rounded_rectangle([x, y, x + lado, y + lado], radius=lado // 4, fill=VERDE)
    f = fonte(FONTE_BOLD, int(lado * 0.6))
    caixa = desenho.textbbox((0, 0), "S", font=f)
    desenho.text(
        (x + (lado - (caixa[2] - caixa[0])) / 2 - caixa[0], y + (lado - (caixa[3] - caixa[1])) / 2 - caixa[1]),
        "S",
        font=f,
        fill=BRANCO,
    )


def quebrar(desenho: ImageDraw.ImageDraw, texto: str, f, largura_max: int) -> list[str]:
    palavras = texto.split()
    linhas: list[str] = []
    atual = ""
    for palavra in palavras:
        teste = f"{atual} {palavra}".strip()
        if desenho.textlength(teste, font=f) <= largura_max:
            atual = teste
        else:
            if atual:
                linhas.append(atual)
            atual = palavra
    if atual:
        linhas.append(atual)
    return linhas


def sem_moldura(imagem: Image.Image) -> Image.Image:
    """Recorta a parte vazia em volta da tela capturada.

    O navegador automatizado as vezes devolve um quadro maior do que a área
    realmente pintada (viewport emulado), o que deixa uma faixa lisa em volta.
    Aqui a imagem é cortada no conteúdo, comparando com a cor do canto.
    """
    cantos = [
        imagem.getpixel((imagem.width - 1, 0)),
        imagem.getpixel((imagem.width - 1, imagem.height - 1)),
        imagem.getpixel((0, imagem.height - 1)),
    ]
    fundo = max(set(cantos), key=cantos.count)
    diferenca = ImageChops.difference(imagem, Image.new("RGB", imagem.size, fundo)).convert("L")
    caixa = diferenca.point(lambda p: 255 if p > 10 else 0).getbbox()
    return imagem.crop(caixa) if caixa else imagem


def colar_tela(base: Image.Image, arquivo: str, caixa: tuple[int, int, int, int]) -> None:
    """Cola uma captura com cantos arredondados e borda sutil."""
    x, y, largura, altura = caixa
    tela = sem_moldura(Image.open(PASTA_TELAS / arquivo).convert("RGB"))
    tela = ImageOps_fit(tela, (largura, altura))

    mascara = Image.new("L", (largura, altura), 0)
    ImageDraw.Draw(mascara).rounded_rectangle([0, 0, largura - 1, altura - 1], radius=14, fill=255)
    base.paste(tela, (x, y), mascara)

    ImageDraw.Draw(base).rounded_rectangle(
        [x, y, x + largura - 1, y + altura - 1], radius=14, outline=(71, 85, 105), width=2
    )


def ImageOps_fit(imagem: Image.Image, tamanho: tuple[int, int]) -> Image.Image:
    """Recorte central para o aspecto pedido (evita esticar a tela)."""
    alvo = tamanho[0] / tamanho[1]
    atual = imagem.width / imagem.height
    if atual > alvo:
        nova_largura = round(imagem.height * alvo)
        sobra = (imagem.width - nova_largura) // 2
        imagem = imagem.crop((sobra, 0, sobra + nova_largura, imagem.height))
    else:
        nova_altura = round(imagem.width / alvo)
        sobra = (imagem.height - nova_altura) // 3
        imagem = imagem.crop((0, sobra, imagem.width, sobra + nova_altura))
    return imagem.resize(tamanho, Image.LANCZOS)


def composicao(largura: int, altura: int, saida: str, tela: str, escala: float) -> None:
    """Layout de duas colunas (texto | tela) na horizontal, empilhado no quadrado."""
    imagem = fundo(largura, altura)
    desenho = ImageDraw.Draw(imagem)
    margem = round(largura * 0.047)
    vertical = altura > largura  # quadrado/retrato empilha

    marca(desenho, margem, margem, round(44 * escala))
    desenho.text((margem + round(58 * escala), margem + round(6 * escala)), "SysConf", font=fonte(FONTE_BOLD, round(34 * escala)), fill=BRANCO)

    if vertical:
        largura_texto = largura - 2 * margem
        y = margem + round(110 * escala)
        f_titulo = fonte(FONTE_BOLD, round(52 * escala))
        for linha in quebrar(desenho, TITULO, f_titulo, largura_texto):
            desenho.text((margem, y), linha, font=f_titulo, fill=BRANCO)
            y += round(62 * escala)
        y += round(18 * escala)

        f_bullet = fonte(FONTE_NORMAL, round(26 * escala))
        for item in BULLETS:
            desenho.text((margem, y), f"•  {item}", font=f_bullet, fill=CINZA_CLARO)
            y += round(38 * escala)

        f_selo = fonte(FONTE_BOLD, round(26 * escala))
        selo_largura = round(desenho.textlength(SELO, font=f_selo) + 44 * escala)
        desenho.rounded_rectangle(
            [margem, y + round(10 * escala), margem + selo_largura, y + round(66 * escala)],
            radius=round(28 * escala),
            fill=(6, 78, 59),
            outline=VERDE_CLARO,
            width=2,
        )
        desenho.text((margem + round(22 * escala), y + round(26 * escala)), SELO, font=f_selo, fill=VERDE_CLARO)

        colar_tela(imagem, tela, (margem, altura - margem - round(560 * escala), largura - 2 * margem, round(560 * escala)))
    else:
        coluna = round(largura * 0.47)
        y = margem + round(120 * escala)
        f_titulo = fonte(FONTE_BOLD, round(48 * escala))
        for linha in quebrar(desenho, TITULO, f_titulo, coluna - margem):
            desenho.text((margem, y), linha, font=f_titulo, fill=BRANCO)
            y += round(58 * escala)
        y += round(16 * escala)

        f_bullet = fonte(FONTE_NORMAL, round(23 * escala))
        for item in BULLETS:
            for i, linha in enumerate(quebrar(desenho, f"•  {item}", f_bullet, coluna - margem)):
                desenho.text((margem, y), linha, font=f_bullet, fill=CINZA_CLARO)
                y += round(32 * escala)

        f_selo = fonte(FONTE_BOLD, round(23 * escala))
        selo_largura = round(desenho.textlength(SELO, font=f_selo) + 40 * escala)
        desenho.rounded_rectangle(
            [margem, y + round(12 * escala), margem + selo_largura, y + round(64 * escala)],
            radius=round(26 * escala),
            fill=(6, 78, 59),
            outline=VERDE_CLARO,
            width=2,
        )
        desenho.text((margem + round(20 * escala), y + round(26 * escala)), SELO, font=f_selo, fill=VERDE_CLARO)

        x_tela = coluna + round(24 * escala)
        largura_tela = largura - margem - x_tela
        altura_tela = round(largura_tela * 0.625)
        colar_tela(imagem, tela, (x_tela, (altura - altura_tela) // 2, largura_tela, altura_tela))

    f_assinatura = fonte(FONTE_NORMAL, round(20 * escala))
    desenho.text((margem, altura - margem - round(18 * escala)), ASSINATURA, font=f_assinatura, fill=CINZA_MEDIO)
    imagem.save(PASTA / saida, optimize=True)
    print(f"  {saida}  {imagem.width}x{imagem.height}")


def icone(lado: int, saida: str) -> None:
    imagem = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
    desenho = ImageDraw.Draw(imagem)
    desenho.rounded_rectangle([0, 0, lado - 1, lado - 1], radius=round(lado * 0.22), fill=VERDE)

    f = fonte(FONTE_BOLD, round(lado * 0.62))
    caixa = desenho.textbbox((0, 0), "S", font=f)
    desenho.text(
        ((lado - (caixa[2] - caixa[0])) / 2 - caixa[0], (lado - (caixa[3] - caixa[1])) / 2 - caixa[1] - lado * 0.04),
        "S",
        font=f,
        fill=BRANCO,
    )

    # barras de código de barras (o produto inteiro é sobre bipar)
    base_y = round(lado * 0.74)
    altura_barra = round(lado * 0.12)
    x = round(lado * 0.26)
    for i, espessura in enumerate([round(lado * 0.035), round(lado * 0.012), round(lado * 0.028), round(lado * 0.012), round(lado * 0.035), round(lado * 0.02)]):
        desenho.rectangle([x, base_y, x + espessura, base_y + altura_barra], fill=BRANCO)
        x += espessura + round(lado * 0.022)

    imagem.save(PASTA / saida, optimize=True)
    print(f"  {saida}  {lado}x{lado}")


CAPTURAS = ["tela-conferencia.png", "tela-bipagem.png", "tela-importacao.png", "tela-grid.png"]


def limpar_capturas() -> None:
    """Recorta a moldura vazia e regrava o proprio arquivo da captura.

    O emulador de navegador as vezes devolve um quadro maior que a area pintada
    pelo app; sem isso a imagem aparece com uma faixa lisa em volta na landing.
    """
    for nome in CAPTURAS:
        caminho = PASTA_TELAS / nome
        if not caminho.exists():
            continue
        original = Image.open(caminho).convert("RGB")
        limpa = sem_moldura(original)
        if limpa.size != original.size:
            limpa.save(caminho, optimize=True)
            print(f"  {nome}: {original.width}x{original.height} -> {limpa.width}x{limpa.height}")


if __name__ == "__main__":
    PASTA.mkdir(parents=True, exist_ok=True)
    print("gerando imagens de divulgação:")

    limpar_capturas()

    composicao(1200, 630, "og-v2.png", "tela-bipagem.png", 1.0)
    composicao(1600, 900, "post-largo-v2.png", "tela-conferencia.png", 1.25)
    composicao(1080, 1080, "post-quadrado-v2.png", "tela-bipagem.png", 1.0)
    composicao(1080, 1350, "post-retrato-v2.png", "tela-importacao.png", 1.05)

    icone(512, "icone-512-v2.png")
    icone(192, "icone-192-v2.png")
    icone(180, "icone-180-v2.png")
    icone(32, "icone-32-v2.png")

    print("pronto.")
