import * as signalR from '@microsoft/signalr';
import { authStore } from '@/modules/auth/infrastructure/authStore';

const HUB_BASE = import.meta.env.VITE_HUB_BASE_URL ?? '/hubs';

export function criarConexaoHub(nome: string): signalR.HubConnection {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${HUB_BASE}/${nome}`, {
      accessTokenFactory: () => authStore.getAccessToken() ?? '',
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}
