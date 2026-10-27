# Despliegue

NaturaPlát se publica como **sitio estático en Vercel Hobby**, enlazado al repositorio de GitHub.
Cada push a la rama por defecto genera un despliegue; no hay workflow de despliegue ni paso de
build.

## Requisitos

- Repositorio: `https://github.com/INEDSantaBarbara/NaturaPlat`.
- Cuenta de Vercel con plan **Hobby** y el proveedor GitHub conectado
  (_Account Settings → Login Connections_).
- Proyecto de Vercel enlazado a ese repositorio.

## Identidad git (obligatoria)

En Hobby con repositorio **privado**, Vercel solo despliega commits cuyo **autor** sea el dueño de
la cuenta. Vercel compara el email verificado del dueño, no el permiso de push. Un email
`usuario@users.noreply.github.com` **no** sirve.

El `Makefile` declara la identidad del proyecto:

```make
GIT_NAME  := MILAB INED Santa Bárbara
GIT_EMAIL := inedsantabarbaramilab@gmail.com
```

Después de clonar:

```bash
make git-config
make check-identity
```

`make check-identity` falla si el email local del repositorio no coincide. Si ya existen commits con
otro autor, hay que reautorarlos (`git commit --amend --reset-author`) o crear un commit nuevo: los
commits viejos no se redespliegan solos.

> El `GIT_NAME` es solo la firma visible del commit. Si el nombre del equipo cambia, se edita el
> Makefile; el correo es el que valida Vercel.

## Configuración de Vercel

`vercel.json` versiona todo lo necesario:

```json
{
  "framework": null,
  "installCommand": "npm ci --omit=dev",
  "outputDirectory": "public",
  "cleanUrls": true
}
```

- `installCommand` omite devDependencies: no se instala Playwright durante el despliegue.
- `outputDirectory: public` publica solo el sitio.
- `cleanUrls: true` permite `/` sin `.html`.
- Cabeceras: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy` y caché de una hora con revalidación para `css/`, `js/` e `img/`.

El preset de Vercel es **Other** (sin framework). No se configura `buildCommand`.

### Guía con DeepSeek

La función `api/chat.js` se detecta automáticamente. Para habilitar el modelo, agregá en
**Vercel → Project → Settings → Environment Variables**:

- `DEEPSEEK_API_KEY` (Production y Preview), obligatoria para la guía en línea.
- `BURST_PER_MINUTE=8`, `DAILY_REQUEST_LIMIT=200`, `DAILY_PER_IP_LIMIT=30` (opcionales).
- `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` (opcionales, para el tope global
  persistente).

Sin `DEEPSEEK_API_KEY` el sitio funciona igual: la guía responde con el banco local y avisa
que la versión en línea no está configurada. Los límites y el detalle están en
[`docs/asistente.md`](asistente.md).

### Caché de assets

Los archivos de `css/` y `js/` no llevan hash en el nombre. Por eso `vercel.json` los sirve con
`Cache-Control: public, max-age=0, must-revalidate`: el navegador revalida en cada visita y un
despliegue nuevo se ve al instante. Además, `index.html` referencia `tokens.css`, `styles.css` y
`main.js` con `?v=<versión>`; al publicar cambios en CSS o JS, subí ese número junto con la
versión de `package.json`. Sin esto, un navegador puede ejecutar un `main.js` viejo que importa
módulos que ya no existen y la página queda sin JavaScript (sin flechas ni avance automático).

## Publicación manual

Solo como excepción justificada:

```bash
make deploy    # npx vercel --prod
```

Requiere Vercel CLI autenticado. No sustituye el auto-deploy: la vía normal es el push a la rama
por defecto.

## Problemas frecuentes

| Síntoma                                                                                  | Causa                                                                          | Solución                                                                              |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| «The deployment was blocked because the commit author does not have contributing access» | El autor del commit no es el dueño de la cuenta Hobby                          | `make git-config`, reautorar el commit y volver a empujar                             |
| La página muestra otro proyecto MILAB en `localhost:4173`                                | Otro servidor de desarrollo ocupa el puerto y el navegador cacheó la respuesta | Cerrar el servidor anterior; `server.js` ya envía `no-cache`. Recarga forzada una vez |
| `make test-e2e` falla con «port 4173 is used»                                            | Hay un servidor colgado en el puerto compartido                                | `make free-port` (SIGTERM y luego SIGKILL si hace falta)                              |
| El sitio se ve sin las tipografías de marca                                              | No hay acceso a Google Fonts                                                   | Es esperado: se usan las familias de respaldo                                         |
