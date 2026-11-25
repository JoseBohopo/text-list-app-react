---
name: calidad-codigo
description: Analiza y propone mejoras de calidad, mantenibilidad, tipado, validación y documentación. Úsala al implementar, revisar o refactorizar código.
---

# Calidad de código

## Regla principal

Por defecto, analiza y propone: no crees, edites ni elimines archivos, ni
instales dependencias. El usuario aplica los cambios en su código.

Si el usuario solicita expresamente un cambio, modifica solo lo pedido.
Presenta cualquier mejora adicional como sugerencia y espera autorización.

## Antes de revisar

1. Comprende el comportamiento esperado y el contexto del código.
2. Identifica las convenciones, dependencias y herramientas del proyecto.
3. Prioriza problemas que afecten a la corrección, seguridad o mantenimiento.
4. No señales preferencias de estilo como errores si el proyecto ya es coherente.
5. Si un requisito importante no está claro, pregunta antes de proponer cambios.

## Código mantenible

- Prioriza soluciones sencillas, legibles y ajustadas al problema.
- Separa responsabilidades cuando mejore la comprensión o reutilización.
- Evita duplicaciones relevantes y abstracciones prematuras.
- Usa nombres claros y coherentes con el proyecto.
- Mantén los cambios propuestos dentro del alcance solicitado.
- Añade comentarios solo cuando expliquen decisiones o lógica no evidentes.

## TypeScript

- Usa los tipos y patrones existentes del proyecto.
- Evita `any`, conversiones forzadas y supresiones innecesarias.
- Valida los datos externos antes de confiar en su estructura.
- Representa los estados y errores de forma que el código pueda manejarlos.
- No debilites el tipado para ocultar un problema.

## Errores y validación

- Identifica entradas inválidas y casos límite relevantes.
- Gestiona los errores de forma explícita y coherente con el proyecto.
- No ocultes fallos ni presentes resultados falsos como si fueran correctos.
- Evita exponer información sensible en mensajes o registros.
- Utiliza la validación existente; propone Zod o una alternativa solo cuando
  exista una necesidad justificada.

## Herramientas y documentación

- Identifica los comandos existentes de lint, formato y comprobación de tipos.
- No añadas herramientas ni cambies su configuración sin autorización.
- No ejecutes comandos que modifiquen archivos sin autorización expresa.
- Propón actualizar el README o la documentación afectada cuando proceda.
- Sugiere pruebas para el comportamiento nuevo o corregido.

## Resultado de la revisión

Para cada problema relevante, indica:

1. Ubicación y comportamiento observado.
2. Por qué importa y en qué condiciones ocurre.
3. Cambio recomendado, con un ejemplo concreto si ayuda.
4. Comprobación o prueba que permitiría verificarlo.

Distingue los problemas confirmados de las dudas y mejoras opcionales. No
afirmes haber ejecutado comprobaciones que no hayas realizado.