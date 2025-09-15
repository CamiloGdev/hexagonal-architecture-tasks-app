# 3. Rendimiento por Categoría

**Pregunta:** ¿Qué categorías tienen las tasas de completado más altas y más bajas, y cuál es el tiempo promedio de completado para cada categoría?

-----

Esta consulta nos ayuda a medir el **rendimiento en áreas específicas de trabajo**. Nos ayudará a identificar qué tipos de tareas son "victorias rápidas" y cuáles representan los mayores desafíos o cuellos de botella.

La pregunta requiere dos métricas distintas por cada categoría:

1. **Tasa de Completado:** Un porcentaje que mide la eficiencia (`Tareas Completadas / Tareas Totales`).
2. **Tiempo Promedio de Completado:** Un intervalo de tiempo que mide la velocidad del ciclo de vida de las tareas que sí se finalizan.

-----

## **Consulta SQL**

Para obtener ambas métricas en una sola consulta eficiente, uniremos las tablas de `categories` y `tasks` y usaremos agregación condicional. El uso de `LEFT JOIN` es fundamental para asegurar que incluyamos todas las categorías, incluso aquellas sin tareas asignadas.

```sql
SELECT
  c.name AS "Categoría",
  -- Conteo total de tareas para dar contexto.
  COUNT(t.id) AS "Total de Tareas",

  -- Métrica 1: Tasa de Completado (%)
  -- Usamos FILTER para contar condicionalmente solo las tareas completadas.
  -- El casting a ::DECIMAL y el NULLIF son cruciales para un cálculo de porcentaje seguro y preciso.
  (COUNT(t.id) FILTER (WHERE t.completed = true))::DECIMAL * 100 / NULLIF(COUNT(t.id), 0) AS "Tasa de Completado (%)",

  -- Métrica 2: Tiempo Promedio de Completado
  -- AGE(end, start) calcula el intervalo de tiempo.
  -- AVG() promedia esos intervalos, ignorando automáticamente las tareas no completadas (donde completed_at es NULL).
  -- Usamos COALESCE para mostrar un intervalo '0' en lugar de NULL si no hay tareas completadas.
  COALESCE(AVG(AGE(t.completed_at, t.created_at)) FILTER (WHERE t.completed = true), '0 days'::interval) AS "Tiempo Promedio de Completado"

FROM
  categories AS c
LEFT JOIN
  tasks AS t ON c.id = t.category_id
GROUP BY
  c.id, c.name -- Agrupamos por ID y nombre de la categoría.
ORDER BY
  "Tasa de Completado (%)" DESC NULLS LAST, -- Ordenamos para ver las mejores categorías primero.
  "Tiempo Promedio de Completado" ASC;      -- Como desempate, las más rápidas primero.
```

## **Desglose de la Lógica**

1. **`LEFT JOIN`**: Empezamos desde `categories` y unimos `tasks`. Esto garantiza que si una categoría como "Ideas a Futuro" existe pero no tiene ninguna tarea, aún aparecerá en el reporte con 0 tareas y una tasa de completado nula, lo cual es información valiosa.
2. **Tasa de Completado (%)**:
      * `COUNT(t.id)` nos da el denominador (todas las tareas de la categoría).
      * `COUNT(t.id) FILTER (WHERE t.completed = true)` es una forma elegante y eficiente en PostgreSQL de obtener el numerador (solo las tareas completadas).
      * `NULLIF(..., 0)` previene errores de división por cero si una categoría no tiene tareas.
3. **Tiempo Promedio de Completado**:
      * La función `AGE(timestamp_final, timestamp_inicial)` calcula la diferencia entre dos fechas y devuelve un tipo de dato `INTERVAL` (ej. '3 days 04:15:21').
      * `AVG()` puede promediar directamente estos intervalos. De forma inherente, solo opera sobre las filas donde `completed_at` no es nulo, por lo que calcula el promedio únicamente sobre las tareas finalizadas.
      * El `ORDER BY` es clave para cumplir el requisito de la pregunta: mostrar las categorías con las tasas más altas y más bajas de forma ordenada.

-----

### **Formato de Salida Esperado**

La consulta producirá una tabla de resumen, clasificando cada categoría por su rendimiento.

| Categoría | Total de Tareas | Tasa de Completado (%) | Tiempo Promedio de Completado |
| :--- | :--- | :--- | :--- |
| `Administrativo` | 85 | `95.29` | `0 days 08:32:15` |
| `Reuniones` | 120 | `91.67` | `1 days 03:10:00` |
| `Desarrollo Frontend` | 95 | `78.95` | `5 days 11:45:30` |
| `Investigación I+D` | 25 | `40.00` | `18 days 22:05:00` |
| `Ideas a Futuro` | 0 | `NULL` | `0 days 00:00:00` |

-----

## **Análisis e Interpretación de Negocio 🧠**

Este reporte no solo muestra "qué" categorías funcionan mejor, sino que nos ayuda a entender el "porqué" y a tomar acciones. Podemos clasificar las categorías en un cuadrante de rendimiento:

* **Alta Tasa de Completado / Bajo Tiempo Promedio (Ej: `Administrativo`)**: 🏆 **Victorias Rápidas**. Son tareas rutinarias, bien definidas y que fluyen sin problemas. Representan la eficiencia operativa.
* **Baja Tasa de Completado / Alto Tiempo Promedio (Ej: `Investigación I+D`)**: 🐢 **Proyectos Complejos o Cuellos de Botella**. Estas categorías consumen mucho tiempo y a menudo se abandonan o se posponen. No es necesariamente malo (la innovación lleva tiempo), pero es donde se concentra el esfuerzo y el riesgo. **Acción:** ¿Necesitan más recursos? ¿Se pueden dividir las tareas en subtareas más pequeñas?
* **Alta Tasa de Completado / Alto Tiempo Promedio (Ej: `Desarrollo Frontend` en un proyecto largo)**:  marathon **Proyectos a Largo Plazo**. Las tareas aquí son extensas pero se completan de manera fiable. Indican un buen seguimiento de proyectos de larga duración.
* **Baja Tasa de Completado / Bajo Tiempo Promedio**: 🤔 **Tareas de Baja Prioridad**. Son tareas que serían rápidas de hacer pero que a menudo se descartan. Pueden ser "ruido" o ideas que nunca se priorizan. **Acción:** ¿Vale la pena mantener esta categoría o está distrayendo del trabajo importante?

Este análisis permite a un equipo o a una empresa optimizar la asignación de recursos, identificar procesos que necesitan mejora y entender mejor la naturaleza del trabajo que se realiza.
