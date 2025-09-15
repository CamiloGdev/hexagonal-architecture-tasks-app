# 5. Análisis de Tareas Vencidas

**Pregunta:** ¿Cuántas tareas están actualmente vencidas, agrupadas por usuario y categoría, y cuál es el promedio de días que están vencidas?

-----

Esta consulta es útil para la gestión de proyectos y la salud del sistema. Nos permite identificar la "deuda de trabajo" y encontrar puntos de fricción, ya sea con usuarios específicos o en tipos de tareas concretas.

La pregunta requiere dos métricas clave para las tareas vencidas, agrupadas por usuario y categoría:

1. **El volumen:** ¿Cuántas tareas están vencidas?
2. **La gravedad:** ¿Por cuántos días en promedio están vencidas?

-----

## **Consulta SQL**

Esta consulta une las tablas de tareas, usuarios y categorías, filtra para encontrar únicamente las tareas vencidas y luego agrupa los resultados para calcular las métricas solicitadas.

```sql
SELECT
  u.name AS "Usuario",
  c.name AS "Categoría",

  -- Métrica 1: Conteo de tareas que cumplen la condición de vencidas.
  COUNT(t.id) AS "Total Tareas Vencidas",

  -- Métrica 2: Promedio de días de retraso.
  -- (CURRENT_DATE - t.due_date) calcula la diferencia en días.
  -- Usamos AVG() para promediar y ROUND() para un resultado limpio.
  ROUND(AVG(CURRENT_DATE - t.due_date), 2) AS "Promedio de Días Vencidas"

FROM
  tasks AS t
-- Unimos con las otras tablas para obtener información legible.
INNER JOIN
  users AS u ON t.user_id = u.id
INNER JOIN
  categories AS c ON t.category_id = c.id
WHERE
  -- Definición de una tarea "vencida":
  t.completed = false -- 1. No está completada.
  AND t.due_date IS NOT NULL -- 2. Tiene una fecha de vencimiento.
  AND t.due_date < CURRENT_DATE -- 3. Esa fecha ya pasó.
GROUP BY
  u.id, c.id, u.name, c.name -- Agrupamos por usuario y categoría.
ORDER BY
  "Total Tareas Vencidas" DESC, -- Mostramos primero los casos más problemáticos.
  "Promedio de Días Vencidas" DESC;
```

## **Desglose de la Lógica**

1. **Cláusula `WHERE` (El Filtro Clave)**: Aquí es donde definimos qué es una tarea vencida. Es una combinación de tres condiciones lógicas que deben cumplirse simultáneamente.
2. **`INNER JOIN`**: Usamos `INNER JOIN` porque solo nos interesan las tareas que tienen un usuario y una categoría válidamente asociados para poder agruparlas correctamente.
3. **Cálculos en `SELECT`**:
      * `COUNT(t.id)` es sencillo, simplemente cuenta cuántas filas (tareas) hay en cada grupo después de aplicar el filtro `WHERE`.
      * `ROUND(AVG(CURRENT_DATE - t.due_date), 2)` es el cálculo de la "gravedad". PostgreSQL permite restar fechas directamente, lo que resulta en un número entero de días. `AVG` calcula el promedio de esos días de retraso para el grupo, y `ROUND` lo formatea a dos decimales.
4. **`GROUP BY` y `ORDER BY`**: Agrupamos por usuario y categoría para obtener las métricas por cada combinación. El ordenamiento es crucial para que el reporte sea accionable, mostrando inmediatamente los puntos más críticos en la parte superior.

-----

### **Formato de Salida Esperado**

La consulta generará una lista de "puntos calientes" de tareas vencidas, priorizada para la acción.

| Usuario | Categoría | Total Tareas Vencidas | Promedio de Días Vencidas |
| :--- | :--- | :--- | :--- |
| `Ana García` | `Desarrollo Backend` | `15` | `25.50` |
| `Carlos Rivas`| `Reportes Financieros`| `12` | `10.20` |
| `Ana García` | `Revisión de Código` | `8` | `5.75` |
| `Lucía Matos` | `Diseño UX` | `5` | `45.80` |
| ... | ... | ... | ... |

-----

## **Análisis e Interpretación de Negocio 🚨**

Este reporte es una herramienta de diagnóstico fundamental para un líder de equipo o un gestor de proyectos. Permite identificar diferentes tipos de problemas:

* **Alto Conteo / Alto Promedio (Ej: Ana en `Backend`)**: 🚨 **Zona de Riesgo Crítico**. Este es el peor escenario. Un usuario está significativamente atascado en una categoría, y el problema no es reciente. **Acción inmediata:** Requiere una conversación directa. ¿El usuario está sobrecargado? ¿Las tareas en esa categoría son más complejas de lo estimado? ¿Hay bloqueos externos?

* **Alto Conteo / Bajo Promedio (Ej: Carlos en `Reportes`)**: ⚠️ **Sobrecarga Reciente**. El problema es nuevo. El usuario ha acumulado rápidamente tareas vencidas. **Acción preventiva:** Se debe actuar antes de que el promedio de días aumente. Puede ser un pico de trabajo temporal o el inicio de un problema mayor.

* **Bajo Conteo / Alto Promedio (Ej: Lucía en `Diseño`)**: 🐌 **Tareas "Fósiles" o Ignoradas**. Hay unas pocas tareas que han sido olvidadas por mucho tiempo. Probablemente son de baja prioridad, pero ensucian el sistema y pueden ocultar problemas subyacentes. **Acción de limpieza:** Se deben revisar estas tareas específicas. ¿Siguen siendo relevantes? ¿Deberían re-priorizarse o eliminarse?

En definitiva, este análisis permite pasar de una gestión reactiva a una **gestión proactiva del riesgo y la carga de trabajo**, asegurando que nadie esté sobrecargado y que los proyectos avancen de manera saludable.
