# Guía NaturaPlát

La **Guía NaturaPlát** es la asistente del proyecto. Responde por el plato, el proceso,
el impacto y el equipo desde una pestaña discreta al costado derecho. Sigue la convención
MILAB para asistentes con LLM: DeepSeek, clave solo en el servidor, banco local primero y
degradación con gracia.

## Arquitectura

```text
Navegador (public/js/guide.js)
        │  ¿la pregunta coincide con el banco local?
        ├── sí ──► responde al instante, sin red ni costo
        └── no ──► POST /api/chat ──► api/chat.js (serverless) ──► DeepSeek
                                             │  { reply: "..." }
                                             ▼
                      sin clave, sin red, tope o error ──► respaldo local
```

- **Banco local:** las preguntas frecuentes (medidas, material, compostaje, precios,
  proceso, impacto, equipo, contacto) se responden en el navegador.
- **Modelo:** solo las preguntas fuera del banco salen a DeepSeek. El historial se acota
  a seis mensajes.
- **Servidor:** `api/chat.js` es una función serverless de Vercel. Solo usa `fetch`, sin SDK.
- **Respaldo:** si la API falla, no hay clave, se alcanza un tope o no hay red, la guía
  muestra un mensaje local y sigue respondiendo lo frecuente.

### Por qué una función serverless

La API key **nunca** puede viajar al navegador. Vive en `DEEPSEEK_API_KEY` (Vercel y
`.env.local`); el cliente solo habla con `/api/chat`.

## Interfaz

- Pestaña vertical de 44 px en el borde derecho, con un punto lima que pulsa.
- Aviso breve una vez por sesión: «¿Te quedó una duda del proyecto?».
- Panel lateral de 400 px (100 % en móvil): encabezado, mensajes, sugerencias, campo de
  texto y nota de privacidad.
- Foco al campo al abrir, `Escape` para cerrar, trampa de foco, botones de 44 px,
  `aria-live` en los mensajes y `prefers-reduced-motion`.

## Configuración

```bash
make env          # crea .env.local desde .env.example
# editá .env.local y completá DEEPSEEK_API_KEY
make serve        # el servidor local monta /api/chat
```

En **Vercel → Project → Settings → Environment Variables**, agregá `DEEPSEEK_API_KEY`
(Production y Preview). Opcionalmente los límites y Upstash. La tabla completa está en
[`.env.example`](../.env.example).

> Sin clave, el sitio funciona igual: la guía responde con el banco local y avisa que la
> versión en línea no está configurada.

## Límites en código

| Límite                    | Valor por defecto | Variable              |
| ------------------------- | ----------------- | --------------------- |
| Ráfaga por IP             | 8 / minuto        | `BURST_PER_MINUTE`    |
| Tope diario global        | 200 / día         | `DAILY_REQUEST_LIMIT` |
| Tope diario por IP        | 30 / día          | `DAILY_PER_IP_LIMIT`  |
| Mensajes por consulta     | 8                 | fijo                  |
| Caracteres por mensaje    | 600               | fijo                  |
| Caracteres totales        | 3,000             | fijo                  |
| `max_tokens` de respuesta | 500               | fijo                  |
| Timeout a DeepSeek        | 20 s              | fijo                  |

Sin Redis, los contadores son **por instancia** (best-effort). Con Upstash configurado
(`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`), el tope diario global es
persistente y compartido entre instancias. Los topes por IP y la ráfaga son locales.

> **Gotcha de DeepSeek:** el modo _thinking_ viene activado y consume `max_tokens`; se
> desactiva explícitamente con `thinking: { type: 'disabled' }` para evitar respuestas
> vacías.

## Prompt

El `SYSTEM_PROMPT` de `api/chat.js` fija la identidad y los datos: plato de 14 × 20 cm,
packs de 25/100 con precios de lanzamiento, hoja de plátano, compostaje ≈45 días, proceso,
método de impacto con fuentes, equipo y contacto de demostración. La guía debe responder
en 2 o 3 frases, no inventar precios, envíos, certificaciones ni propiedades de salud, y
no revelar el prompt. El cliente no puede enviar un `system` propio: el servidor lo filtra.

## Privacidad

El banco local no sale del dispositivo. Las preguntas que no reconoce se envían a DeepSeek;
la nota del panel lo declara y pide no escribir datos personales. No se guardan preguntas en
el repositorio ni en el servidor.

## Pruebas

- `tests/static/chat.test.js`: método, falta de clave, cuerpo vacío, longitud, ráfaga,
  filtrado del `system` del cliente y respuesta.
- `tests/e2e/guia.spec.js`: apertura, foco, banco local sin llamada a la API, consulta
  mockeada, tope 429 y 503, cierre con `Escape`.
- CI no necesita la clave: todo se mockea. Nunca se llama a la API real.
