# 1. Análisis de Participación de Usuarios

**Pregunta:** ¿Cuál es el promedio de tareas creadas por usuario en los últimos 30 días, y cómo se compara con los 30 días anteriores?

-----

Busca medir la actividad reciente de los usuarios y detectar tendencias, como un aumento en el uso de la aplicación o una disminución (lo que podría indicar un problema).

## Consulta SQL Optimizada

Consulta que calcula ambos valores en una sola ejecución, evitando múltiples escaneos de la tabla `tasks`. Utilizaremos Expresiones de Tabla Comunes (CTE) para que la lógica sea clara y legible.

```sql
WITH tasks_periods AS (
  -- Paso 1: Clasificar cada tarea en un período de tiempo (últimos 30 días o los 30 anteriores).
  SELECT
    user_id,
    -- Usamos CASE para asignar cada tarea a su 'bucket' de tiempo correspondiente.
    CASE
      WHEN created_at >= (CURRENT_DATE - INTERVAL '30 days') THEN 'ultimos_30_dias'
      WHEN created_at >= (CURRENT_DATE - INTERVAL '60 days') AND created_at < (CURRENT_DATE - INTERVAL '30 days') THEN '30_dias_anteriores'
    END AS period_time
  FROM
    tasks
  WHERE
    -- Filtramos desde el principio para reducir el conjunto de datos a los últimos 60 días.
    created_at >= (CURRENT_DATE - INTERVAL '60 days')
),

period_statistics AS (
  -- Paso 2: Contar el total de tareas y el número de usuarios únicos (activos) para cada período.
  SELECT
    period_time,
    COUNT(*) AS total_tasks,
    COUNT(DISTINCT user_id) AS active_users
  FROM
    tasks_periods
  WHERE
    period_time IS NOT NULL -- Ignoramos tareas que no cayeron en nuestros buckets definidos.
  GROUP BY
    period_time
)

-- Paso 3: Calcular el promedio final y pivotar los resultados para la comparación.
SELECT
  -- El casting a ::DECIMAL es CRUCIAL para evitar la división de enteros y obtener un resultado preciso.
  (SELECT total_tasks::DECIMAL / active_users FROM period_statistics WHERE period_time = 'ultimos_30_dias') AS promedio_tareas_ultimos_30_dias,
  (SELECT total_tasks::DECIMAL / active_users FROM period_statistics WHERE period_time = '30_dias_anteriores') AS promedio_tareas_30_dias_anteriores;
```

-----

### Desglose de la Lógica de la Consulta

1. **CTE `tasks_periods`**:

      * El primer bloque escanea la tabla `tasks` **una sola vez**, pero solo los registros de los últimos 60 días. Esto es clave para la eficiencia.
      * Usando una declaración `CASE`, "etiqueta" cada tarea según si fue creada en los "últimos 30 días" o en los "30 días anteriores". Esto crea una columna virtual llamada `period_time`.

2. **CTE `period_statistics`**:

      * Este bloque toma los datos ya clasificados del paso anterior.
      * Agrupa por la etiqueta de `period_time` para calcular dos métricas fundamentales para cada uno de los dos periodos:
          * `total_tasks`: Un conteo simple de cuántas tareas hay en cada periodo.
          * `active_users`: Un conteo de los **usuarios distintos** que crearon esas tareas. Es importante usar `DISTINCT` porque queremos el promedio por usuario, no por tarea.

3. **Consulta Final (`SELECT`)**:

      * Esta es la capa de presentación. Realiza el cálculo final dividiendo `total_tasks` entre `active_users` para cada período.
      * Las subconsultas aquí son muy rápidas porque operan sobre los resultados ya agregados de la CTE `period_statistics` (que tendrá como máximo 2 filas).
      * **Punto Crítico**: Se utiliza `::DECIMAL` (o `::FLOAT`) para forzar una división con decimales. Si no se hace esto, PostgreSQL realizaría una división de enteros (ej. `10 / 4 = 2`), lo cual daría un resultado incorrecto.

### Formato de Salida Esperado

El resultado de la consulta será una única fila con dos columnas, ideal para ser consumida por un dashboard o un reporte.

| promedio\_tareas\_ultimos\_30\_dias | promedio\_tareas\_30\_dias\_anteriores |
| :------------------------------ | :--------------------------------- |
| `8.45`                          | `7.20`                             |

-----

### Análisis e Interpretación de Negocio 🧠

El resultado no son solo números, es una historia sobre el comportamiento de los usuarios.

* **¿Qué significa el resultado?** En el ejemplo anterior, el usuario promedio creó **8.45 tareas** en los últimos 30 días, un aumento respecto a las **7.20 tareas** que creó en el período anterior.
* **¿Qué conclusiones podemos sacar?**
  * **Engagement Positivo:** El "engagement" o la participación del usuario está creciendo. Los usuarios no solo están activos, sino que están usando más la aplicación.
  * **Impacto de Cambios:** Si recientemente lanzaste una nueva función, rediseñaste la interfaz o hiciste una campaña de marketing, este podría ser un indicador clave de su éxito.
  * **Salud del Producto:** Un aumento constante en esta métrica indica una base de usuarios saludable y una aplicación que se está volviendo más integral en su flujo de trabajo diario.
* **¿Qué acciones se podrían tomar?**
  * **Si la tendencia es positiva:** Investigar qué cohorte de usuarios (¿nuevos o antiguos?) está impulsando el crecimiento. Doblar la apuesta en las características que están funcionando.
  * **Si la tendencia es negativa:** ¡Es una señal de alerta\! Hay que investigar las posibles causas: ¿hubo un bug reciente? ¿un cambio en la UI que no gustó? ¿la competencia lanzó una función atractiva? Es el momento de realizar encuestas de usuario o analizar el feedback.

### Consideraciones Técnicas Adicionales

* **Índice:** Para que esta consulta sea ultra rápida, especialmente con millones de tareas, es **fundamental** tener un índice en la columna `created_at` de la tabla `tasks`.

    ```sql
    CREATE INDEX idx_tasks_created_at ON tasks(created_at);
    ```
