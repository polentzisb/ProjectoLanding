# CoffeRoast

Landing de café construida con HTML, CSS y JavaScript nativo. Renovación del proyecto original [ProjectoLanding](https://github.com/polentzisb/ProjectoLanding), conservando la marca y las fotografías existentes.

## Ejecutar

Requiere Node.js 20 o superior. No tiene dependencias ni necesita `npm install`.

```sh
npm run dev
```

Abre **http://127.0.0.1:4387**. Si el puerto está ocupado:

```sh
PORT=4388 npm run dev
```

## Verificar y publicar

```sh
npm run check
npm run build
npm run preview
```

`check` revisa la sintaxis de JavaScript, los enlaces internos, recursos locales, IDs únicos, referencias ARIA y datos del catálogo. `build` genera `dist/` con los recursos públicos necesarios. `preview` sirve esa carpeta localmente.

En Netlify, el archivo `netlify.toml` configura `npm run build` y `dist/`. En otros proveedores, publica el contenido de `dist/`. Los encabezados de `_headers` se aplican en proveedores compatibles con ese formato. Un push puede activar la publicación automática si el repositorio está conectado a un proveedor de hosting.

## Qué se mejoró

| Problema original | Solución |
| --- | --- |
| Shop apuntaba a `#shop`, pero la sección era `#product`; Newsletter apuntaba a `#review` | Anclas válidas y verificación automática |
| Textos Lorem Ipsum, faltas ortográficas y contactos ficticios | Contenido en español, catálogo explícitamente demostrativo y correo original conservado |
| Imágenes y anchos fijos, margen global de `-200px`, declaración CSS incompleta | Diseño adaptable desde 320 px, cuadrículas y espaciado por sección |
| Menú basado en un checkbox oculto y sin estado accesible | Botón con `aria-expanded`, cierre con Escape, clic exterior y selección de enlace |
| `outline: none` global y varios encabezados `h1` | Foco visible, enlace para saltar contenido y jerarquía semántica |
| Fotos usadas con un peso total de 15,35 MB | Variantes WebP con `srcset`, 0,72 MB en total (95,3 % menos), carga diferida bajo la portada |
| Dependencia de Google Fonts y Font Awesome | Fuentes del sistema e iconos SVG locales |
| Productos sin interacción | Filtros de café/accesorios y lista con cantidades, eliminación y total |
| Formulario sin envío ni confirmación veraz | Validación nativa y aviso explícito de demostración |
| Sin flujo de verificación o build | Comandos sin dependencias para validar, servir y generar `dist/` |

También se añadieron metadatos SEO/Open Graph, preguntas frecuentes nativas, soporte de movimiento reducido y encabezados de seguridad para el sitio estático.

## Interacciones y privacidad

- Los filtros muestran todos los productos, solo café o solo accesorios.
- La lista permite añadir, quitar y eliminar productos. Admite hasta 99 unidades por producto.
- Se guarda únicamente la lista de IDs y cantidades en `localStorage`; se validan los datos al restaurarla. Si el almacenamiento no está disponible, la lista funciona durante la visita.
- La lista se sincroniza entre pestañas del mismo origen. El diálogo conserva el foco al actualizar cantidades, lo devuelve al botón de apertura y se cierra con Escape.
- El formulario comprueba el formato del correo. **No transmite ni almacena direcciones ni suscribe a nadie.**
- Sin JavaScript, siguen disponibles los textos, productos, navegación y preguntas frecuentes. Los controles interactivos se ocultan y el campo de correo se desactiva.
- No hay analítica, cookies de seguimiento ni solicitudes de fuentes/iconos a terceros.

## Modificar el catálogo

Cada `.product-card` en `index.html` es la fuente de datos: `data-product` identifica el producto, `data-price` define el precio entero en CLP y `data-image` el prefijo de la fotografía. JavaScript lee el nombre del `h3` y estos atributos; no mantiene un segundo catálogo.

Al cambiar un precio, actualiza también el texto `.price` para quienes navegan sin JavaScript. Para añadir un producto, incluye su botón `data-add` con el mismo ID y variantes WebP de 400 y 800 px. Actualiza el contador visual del filtro Todo.

```text
index.html          Contenido y datos del catálogo
CSS/style.css       Estilos, breakpoints y movimiento reducido
js/app.js           Menú, filtros, lista y validación de formulario
assets/images/      Fotografías WebP optimizadas
CSS/images/         Fotografías originales y favicon preservados
scripts/check.mjs   Comprobación de referencias y estructura
scripts/build.mjs   Generación de la carpeta publicable
scripts/serve.mjs   Servidor local de recursos públicos
_headers            Encabezados para hosting compatible
netlify.toml        Configuración de build de Netlify
```

Las fotografías originales se conservan como fuentes, pero quedan fuera de `dist/`, salvo el favicon SVG.

## Validación de esta revisión

Se probaron en el navegador los filtros (2 cafés, 4 accesorios), sumas y restas de cantidades, eliminación, lista vacía, persistencia tras recargar, menú móvil, cierre con Escape y correos inválidos/válidos. Se revisó el diseño entre 320 y 1440 px y se corrigió el desbordamiento detectado en 320 px. `npm run build` ejecuta las comprobaciones estructurales antes de generar la salida.

## Antes de vender o recibir suscripciones

Los productos, precios y textos comerciales son de muestra. Para operar como tienda faltan catálogo/precios aprobados, backend de pedidos, inventario, pagos y políticas comerciales reales. Para el newsletter falta un proveedor de suscripción con consentimiento y gestión de bajas. Al integrarlo, adapta `connect-src` y `form-action` en la política CSP al destino autorizado. Configura también la URL definitiva y una imagen social absoluta antes de añadir `og:url`, `og:image` y una URL canónica.

El sitio original enlazado por el README anterior es [landingpagecoffe.netlify.app](https://landingpagecoffe.netlify.app/). Ese enlace puede seguir mostrando la versión anterior hasta que se publique esta revisión.
