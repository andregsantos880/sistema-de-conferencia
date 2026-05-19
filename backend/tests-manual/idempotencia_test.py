"""Bipa a MESMA etiqueta com o MESMO clientEventId 2 vezes — deve responder JaConferido."""
import json, time, uuid, requests, websocket, threading

BASE = "http://localhost:5000"

def main():
    token = requests.post(f"{BASE}/api/auth/login",
        json={"email":"pedro@gamma.com","senha":"senha12345"}).json()["tokens"]["accessToken"]
    H = {"Authorization": f"Bearer {token}"}

    statuses = requests.get(f"{BASE}/api/status", headers=H).json()
    saida_id = next(s for s in statuses if s["codigo"] == "saida")["id"]

    # Cria pedido novo pra teste
    layouts = requests.get(f"{BASE}/api/layouts", headers=H).json()
    layout_id = next(l for l in layouts if l["ativadoParaTenant"])["id"]
    boxes = requests.get(f"{BASE}/api/boxes", headers=H).json()
    box_id = boxes[0]["id"]
    etq = f"IDEMP-{uuid.uuid4().hex[:8]}"
    r = requests.post(f"{BASE}/api/pedidos", json={
        "etiqueta": etq, "layoutId": layout_id, "boxId": box_id
    }, headers=H)
    print(f"pedido criado: {etq} HTTP {r.status_code}")

    # Avança Normal -> Conferido via lote primeiro (pra etq estar em Conferido)
    conferido_id = next(s for s in statuses if s["codigo"] == "conferido")["id"]
    pid = requests.get(f"{BASE}/api/pedidos?etiqueta={etq}", headers=H).json()["itens"][0]["id"]
    requests.post(f"{BASE}/api/pedidos/lote/alterar-status", json={
        "pedidoIds":[pid], "statusId":conferido_id
    }, headers=H)
    print(f"pedido movido para Conferido via lote")

    # SignalR
    neg = requests.post(f"{BASE}/hubs/conferencia/negotiate?negotiateVersion=1", headers=H).json()
    ws_url = f"ws://localhost:5000/hubs/conferencia?id={neg['connectionToken']}&access_token={token}"
    recebidos = []
    pronto = threading.Event()
    def on_msg(ws, msg):
        for c in msg.split('\x1e'):
            if not c: continue
            try:
                m = json.loads(c)
                if m.get("target") == "conferenciaResultado":
                    recebidos.append(m["arguments"][0])
                elif m == {}: pronto.set()
            except: pass
    ws = websocket.WebSocketApp(ws_url, on_open=lambda w: w.send('{"protocol":"json","version":1}\x1e'), on_message=on_msg)
    threading.Thread(target=ws.run_forever, daemon=True).start()
    pronto.wait(5)

    # Bipa com client_event_id ÚNICO — Conferido -> Saída
    cid = str(uuid.uuid4())
    print(f"\n>>> Bipa 1x (clientEventId={cid[:8]})")
    requests.post(f"{BASE}/api/conferencias",
        json={"clientEventId":cid,"etiqueta":etq,"statusDestinoId":saida_id}, headers=H)

    # Espera resposta
    while len(recebidos) < 1: time.sleep(0.05)
    print(f"  resultado: tipo={recebidos[0]['tipo']} tts='{recebidos[0]['tts']}' status={recebidos[0].get('statusNome')}")

    # Bipa NOVAMENTE com o MESMO client_event_id — deve ser JaConferido (replay)
    print(f"\n>>> Bipa 2x (mesmo clientEventId)")
    requests.post(f"{BASE}/api/conferencias",
        json={"clientEventId":cid,"etiqueta":etq,"statusDestinoId":saida_id}, headers=H)
    while len(recebidos) < 2: time.sleep(0.05)
    print(f"  resultado: tipo={recebidos[1]['tipo']} tts='{recebidos[1]['tts']}' status={recebidos[1].get('statusNome')}")

    # Verifica que só 1 evento foi gravado
    print(f"\n>>> Estado final do pedido:")
    p = requests.get(f"{BASE}/api/pedidos?etiqueta={etq}", headers=H).json()["itens"][0]
    print(f"  {p['etiqueta']} -> {p['statusNome']} {p['statusCor']}")
    ws.close()

if __name__ == "__main__":
    main()
