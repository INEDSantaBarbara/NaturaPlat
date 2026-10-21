# Contribuir

Gracias por sumarte a **NaturaPlát**, un proyecto MILAB del INED Santa Bárbara.

## Puesta en marcha

```bash
make install
make serve        # http://127.0.0.1:4173
```

Lee [`docs/arquitectura.md`](docs/arquitectura.md) antes de tocar el carrito o los estilos.

## Flujo de trabajo

1. Crea una rama desde `main`: `feat/mi-cambio`, `fix/mi-arreglo` o `docs/mi-texto`.
2. Haz cambios pequeños y coherentes: código, pruebas y documentación en el mismo commit.
3. Ejecuta las compuertas locales:

   ```bash
   make format-check
   make lint
   make test
   ```

4. Abre un pull request con el recorrido de prueba y las capturas si cambió la interfaz.

## Reglas del proyecto

- **Un solo `h1`** y jerarquía de títulos sin saltos.
- **Cero hexadecimales fuera de `public/css/tokens.css`**: usa `var(--token)`.
- **Nada de `innerHTML` con datos**: construye nodos con `createElement` y `textContent`.
- **Accesibilidad primero**: foco visible, `aria-*` correcto, errores con `role="alert"` y
  movimiento reducido.
- **Sin datos personales reales** ni secretos en el repositorio. Los datos de ejemplo son
  ficticios y evidentes.
- **Sin dependencias en runtime**: el sitio se sirve tal cual. Las herramientas de calidad son
  `devDependencies`.
- **Los textos de demostración deben decirlo**: si una función no existe (pago, correo, envío),
  la interfaz lo aclara en pantalla.

## Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/es/): `feat:`, `fix:`, `docs:`,
`test:`, `chore:`. Sin atribuciones de IA ni `Co-Authored-By`.

## Identidad git

Antes del primer commit ejecuta `make git-config` y comprueba con `make check-identity`. En Vercel
Hobby el autor del commit debe coincidir con el dueño de la cuenta (ver
[`docs/despliegue.md`](docs/despliegue.md)).

## Reportar problemas

Abre un issue con: qué esperabas, qué ocurrió, navegador y tamaño de pantalla, y los pasos para
reproducirlo. Si es visual, adjunta una captura.
