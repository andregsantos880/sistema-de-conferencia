"""
Smoke test do fluxo de conferência:
1. Login Gamma
2. Lista pedidos + status
3. Conecta no SignalR via WebSocket (handshake JSON minimal)
4. Bipa 3 etiquetas
5. Imprime os resultados que chegaram via SignalR
"""
import json
import time
import uuid
import requests
import websocket
import threading
from urllib.parse import urlencode

BASE = "http://localhost:5000"
HUB_HTTP = f"{BASE}/hubs/conferencia"

def main():
    # 1) Login
    r = requests.post(f"{BASE}/api/auth/login", json={"email": "pedro@gamma.com", "senha": "senha12345"})
    r.raise_for_status()
    auth = r.json()
    token = auth["tokens"]["accessToken"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Login OK. usuario={auth['usuarioId'][:8]} tenant={auth['tenantId'][:8]}")

    # 2) Lista status (precisa do statusId 'conferido' como destino da bipagem)
    statuses = requests.get(f"{BASE}/api/status", headers=headers).json()
    status_conferido = next(s for s in statuses if s["codigo"] == "conferido")
    print(f"Status 'conferido' id={status_conferido['id'][:8]} cor={status_conferido['corHex']}")

    # 3) Lista pedidos
    pedidos = requests.get(f"{BASE}/api/pedidos?tamanho=10", headers=headers).json()
    print(f"Pedidos: {pedidos['total']}")
    for p in pedidos["itens"]:
        print(f"  {p['etiqueta']} | {p['statusNome']} | box {p.get('boxCodigo')}")

    # 4) Negociar handshake do SignalR (POST /hubs/conferencia/negotiate)
    neg = requests.post(f"{HUB_HTTP}/negotiate?negotiateVersion=1", headers=headers).json()
    print(f"Negociado. ConnectionId(server)={neg.get('connectionId')[:8]} connectionToken={neg.get('connectionToken','')[:8]}")
    connection_token = neg["connectionToken"]

    # 5) WebSocket SignalR
    ws_url = f"ws://localhost:5000/hubs/conferencia?id={connection_token}&access_token={token}"

    recebidos = []
    pronto = threading.Event()

    def on_message(ws, message):
        # Mensagens SignalR são separadas por 0x1E
        for chunk in message.split('\x1e'):
            if not chunk: continue
            try:
                msg = json.loads(chunk)
                if msg.get("type") == 1 and msg.get("target") == "conferenciaResultado":
                    recebidos.append(msg["arguments"][0])
                elif msg == {}:  # handshake response
                    pronto.set()
            except json.JSONDecodeError:
                pass

    def on_open(ws):
        # Handshake JSON
        ws.send('{"protocol":"json","version":1}\x1e')

    ws = websocket.WebSocketApp(ws_url, on_open=on_open, on_message=on_message)
    th = threading.Thread(target=ws.run_forever, daemon=True)
    th.start()

    if not pronto.wait(timeout=5):
        print("ERRO: handshake SignalR não respondeu em 5s")
        return
    print("SignalR handshake OK")

    # 6) Bipar 3 etiquetas
    print("\n=== Bipando 3 etiquetas ===")
    eventos = []
    for etq in ["ETQ-001", "ETQ-002", "ETQ-INEXISTENTE"]:
        ev = str(uuid.uuid4())
        eventos.append(ev)
        body = {"clientEventId": ev, "etiqueta": etq, "statusDestinoId": status_conferido["id"]}
        r = requests.post(f"{BASE}/api/conferencias", json=body, headers=headers)
        print(f"  enfileirou {etq} -> HTTP {r.status_code}")

    # 7) Aguarda os 3 resultados via SignalR
    timeout = time.time() + 10
    while len(recebidos) < 3 and time.time() < timeout:
        time.sleep(0.1)

    print(f"\n=== Resultados recebidos via SignalR: {len(recebidos)} ===")
    for r in recebidos:
        print(f"  {r.get('tipo')} | etiqueta={r.get('etiqueta')} | tts='{r.get('tts')}' | status={r.get('statusNome')} cor={r.get('statusCor')}")

    ws.close()

if __name__ == "__main__":
    main()
