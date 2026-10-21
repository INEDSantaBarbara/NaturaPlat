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
| `make test-e2e` falla con «port 4173 is used»                                            | Hay un servidor colgado en el puerto compartido                                | `ss -ltnp \| grep 4173` y cerrar el proceso                                           |
| El sitio se ve sin las tipografías de marca                                              | No hay acceso a Google Fonts                                                   | Es esperado: se usan las familias de respaldo                                         |
