---
name: arquitectura-frontend
description: Analiza y propone arquitectura frontend para React, Next.js y TypeScript. Úsala al revisar o diseñar estructura, componentes, datos, estado, formularios y gestión de errores.
---

# Arquitectura frontend

## Regla principal

Por defecto, analiza y propone: no crees, edites ni elimines archivos, ni
instales dependencias. El usuario aplica los cambios en su código.

Si el usuario solicita expresamente un cambio, modifica solo lo pedido.
Presenta cualquier mejora adicional como sugerencia y espera autorización.

## Antes de analizar

1. Revisa la estructura, dependencias y convenciones del proyecto.
2. Identifica las versiones de React y Next.js, cuando se utilicen.
3. En Next.js, identifica si se usa App Router (`app/`) o Pages Router
   (`pages/`). Las reglas de App Router siguientes no se aplican
   automáticamente a Pages Router.
4. Si falta información necesaria para una decisión importante, pregunta.
5. Prioriza soluciones sencillas y compatibles con el proyecto existente.

## Organización de Next.js

Next.js no exige una estructura única. Recomienda elegir una estrategia
adecuada y mantenerla de forma consistente.

Para App Router:

- Las carpetas anidadas representan segmentos de ruta.
- Una ruta se hace accesible mediante un archivo `page` o `route`.
- Los componentes, utilidades y otros archivos pueden situarse junto a la
  ruta que los utiliza o fuera de `app`, según la estrategia del proyecto.
- Usa grupos como `(marketing)` para organizar rutas sin añadir ese nombre
  a la URL, cuando aporten claridad.
- Las carpetas privadas como `_components` quedan fuera del sistema de
  rutas. Son opcionales, no un requisito.
- La carpeta `src` también es opcional.
- Respeta los archivos especiales y su jerarquía, incluidos `layout`,
  `page`, `loading`, `error` y `not-found`.
- No propongas reorganizar todo el proyecto solo por preferencia personal.

## Server y Client Components

Para App Router y versiones compatibles:

- Mantén en servidor lo que no requiera capacidades del navegador.
- Utiliza componentes de cliente para interacción, estado, efectos o APIs
  del navegador cuando sean necesarios.
- Sitúa la frontera `'use client'` cerca de la parte interactiva para
  evitar enviar más JavaScript del necesario.
- Recuerda que los módulos importados por un componente cliente pasan a
  formar parte de su grafo de cliente.
- Al pasar datos del servidor al cliente, envía solo los necesarios y
  comprueba que las props sean serializables por React.
- No expongas credenciales, datos sensibles ni lógica privada al cliente.
- Un componente de servidor puede pasarse como `children` a uno de cliente.
- React Context requiere un componente cliente; sitúa los proveedores
  donde realmente se necesiten.

## Datos y carga

- En App Router, considera obtener datos en Server Components cuando sea
  apropiado, mediante `fetch` o acceso a datos del lado del servidor.
- Comprueba autenticación y autorización aunque la consulta se ejecute
  en el servidor.
- Evita solicitudes secuenciales innecesarias cuando los datos sean
  independientes, sin comprometer el manejo de errores.
- Para esperas perceptibles, considera `loading.tsx` para un segmento o
  `Suspense` para una parte concreta de la interfaz.
- Diseña estados de carga que ayuden al usuario a entender qué ocurre.
- Ten en cuenta que el `loading` de un segmento no cubre automáticamente
  el trabajo bloqueante de su propio `layout`.
- No supongas las reglas de caché o deduplicación: dependen de la versión,
  configuración y mecanismo de obtención de datos. Consulta la documentación
  aplicable antes de recomendar una estrategia.

## Errores

- Distingue errores esperados, como validaciones fallidas, de excepciones
  inesperadas.
- En Server Functions, considera representar los errores esperados como
  resultados que la interfaz pueda mostrar.
- En Server Components, contempla estados de error o redirecciones cuando
  correspondan.
- Para recursos inexistentes, considera `notFound()` y `not-found.tsx`.
- Para excepciones inesperadas en App Router, considera límites de error
  mediante `error.tsx` en el nivel apropiado.
- Comprueba la documentación de la versión instalada antes de proponer
  APIs concretas de recuperación.
- No ocultes errores ni expongas detalles sensibles al usuario final.

## Componentes, estado y TypeScript

- Separa responsabilidades sin introducir abstracciones innecesarias.
- Reutiliza componentes y utilidades existentes cuando sea apropiado.
- Prefiere tipos seguros y evita `any` innecesario.
- Distingue entre estado local, compartido y datos remotos.
- Usa las herramientas de formularios y estado existentes antes de
  proponer nuevas dependencias.
- Valida los datos en los límites adecuados con la solución del proyecto;
  considera Zod o equivalente cuando se justifique.

## Cómo presentar el resultado

Explica el problema, la solución recomendada y su motivo. Indica los archivos
afectados y muestra ejemplos de código cuando ayuden al usuario a aplicar
los cambios. Señala riesgos, alternativas y pruebas relevantes.

## Fuentes oficiales

- Estructura: https://nextjs.org/docs/app/getting-started/project-structure
- Componentes: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Datos: https://nextjs.org/docs/app/getting-started/fetching-data
- Errores: https://nextjs.org/docs/app/getting-started/error-handling

Consulta la documentación correspondiente a la versión instalada cuando sea
posible. Si no tienes acceso, indícalo y no afirmes haberla verificado.