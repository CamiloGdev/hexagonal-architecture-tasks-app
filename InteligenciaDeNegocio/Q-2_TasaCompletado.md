# 2. Tendencias de Tasa de Completado

**Pregunta:** ¿Cuál es la tasa de completado diaria de tareas en los últimos 90 días, agrupada por nivel de prioridad?

-----

La pregunta sobre la "tasa de completado" es excelente, ya que es una métrica clave de productividad. Sin embargo, el término "tasa" puede interpretarse de varias formas en el análisis de negocio. La elección del enfoque correcto depende del objetivo específico del análisis. A continuación, se presentan tres interpretaciones válidas, cada una respondiendo a una pregunta de negocio diferente.

1. **Tasa como Frecuencia Diaria:** Mide el volumen de trabajo completado cada día, ideal para visualizar tendencias de actividad.
2. **Tasa como Eficiencia de Cohorte:** Mide el porcentaje de trabajo nuevo que se finaliza, ideal para evaluar el rendimiento en ciclos recientes.
3. **Tasa como Liquidación de Pendientes:** Mide el porcentaje de la carga de trabajo total (incluyendo tareas antiguas) que se completa, ideal para un análisis estratégico de la productividad.

Para un análisis exhaustivo, a continuación se detallan las tres metodologías.

-----

## **Enfoque 1: Tasa como Frecuencia Diaria (Tendencias de Actividad)**

Esta es la interpretación más directa para analizar "tendencias". Responde a la pregunta: **"¿Cuántas tareas se completan cada día y cuál es el ritmo de productividad?"**. Es la mejor métrica para visualizar el flujo de trabajo y detectar patrones a lo largo del tiempo.

### **Consulta SQL**

Esta consulta robusta calcula el número de tareas completadas por día y por prioridad, rellenando con ceros los días sin actividad para garantizar una serie de tiempo continua, ideal para graficar.

```sql
-- CTE 1: Agrupar y contar las tareas que sí fueron completadas en el rango de fechas.
WITH daily_completions AS (
  -- Paso 1: Contar las tareas completadas por día y prioridad.
  SELECT
    DATE(completed_at) AS completion_date, -- Extraemos solo la fecha del timestamp.
    priority,
    COUNT(*) AS completed_tasks_count
  FROM
    tasks
  WHERE
    -- Filtramos únicamente las tareas completadas en los últimos 90 días.
    completed_at >= (CURRENT_DATE - INTERVAL '90 days')
  GROUP BY
    completion_date,
    priority
),

-- CTE 2: Generar un 'andamio' con todas las fechas y prioridades para evitar huecos en los datos.
date_priority_scaffold AS (
  -- Paso 2: Generar una serie de todas las fechas de los últimos 90 días.
  SELECT generated_date::date AS completion_date
  FROM generate_series(
    CURRENT_DATE - INTERVAL '90 days',
    CURRENT_DATE,
    '1 day'::interval
  ) AS generated_date
  -- Paso 3: Cruzar las fechas con todos los niveles de prioridad posibles.
  CROSS JOIN
    (VALUES ('LOW'::priority), ('MEDIUM'::priority), ('HIGH'::priority)) AS p(priority_level)
)

-- Paso Final: Unir el 'andamio' con los datos reales y rellenar los valores nulos con 0.
SELECT
  s.completion_date AS "Fecha de Completado",
  s.priority_level AS "Prioridad",
  COALESCE(dc.completed_tasks_count, 0) AS "Total Tareas Completadas"
FROM
  date_priority_scaffold AS s
LEFT JOIN
  daily_completions AS dc ON s.completion_date = dc.completion_date AND s.priority_level = dc.priority
ORDER BY
  s.completion_date DESC,
  s.priority_level ASC;
```

#### **Formato de Salida Esperado**

| Fecha de Completado | Prioridad | Total Tareas Completadas |
| :------------------ | :-------- | :----------------------- |
| `2025-09-14`        | `HIGH`    | `5`                      |
| `2025-09-14`        | `MEDIUM`  | `12`                     |
| `2025-09-14`        | `LOW`     | `8`                      |
| `2025-09-13`        | `HIGH`    | `3`                      |
| ...                 | ...       | ...                      |

-----

## **Enfoque 2: Tasa de Completado de Tareas Nuevas (Eficiencia de Cohorte)**

Este enfoque mide la eficiencia. Responde a la pregunta: **"Del trabajo que iniciamos en los últimos 90 días, ¿qué porcentaje logramos terminar?"**. Es ideal para informes de rendimiento de un período específico.

### **Consulta SQL**

```sql
SELECT
  priority AS "Prioridad",
  -- Numerador: Contar solo las tareas completadas de esta cohorte.
  COUNT(*) FILTER (WHERE completed = true) AS "Tareas Completadas de la Cohorte",
  -- Denominador: Contar todas las tareas de la cohorte.
  COUNT(*) AS "Total Tareas Creadas en la Cohorte",
  -- El cálculo del porcentaje de eficiencia sobre el trabajo nuevo.
  (COUNT(*) FILTER (WHERE completed = true))::DECIMAL * 100 / NULLIF(COUNT(*), 0) AS "Tasa de Completado de Cohorte (%)"
FROM
  tasks
WHERE
  -- La cohorte se define por la fecha de CREACIÓN.
  created_at >= (CURRENT_DATE - INTERVAL '90 days')
GROUP BY
  priority;
```

#### **Formato de Salida Esperado**

| Prioridad | Tareas Completadas de la Cohorte | Total Tareas Creadas en la Cohorte | Tasa de Completado de Cohorte (%) |
| :-------- | :------------------------------- | :--------------------------------- | :-------------------------------- |
| `HIGH`    | `150`                            | `180`                              | `83.33`                           |
| `MEDIUM`  | `400`                            | `500`                              | `80.00`                           |
| `LOW`     | `250`                            | `350`                              | `71.43`                           |

-----

## **Enfoque 3: Tasa de Liquidación de Pendientes (Productividad Total)**

Este es el análisis más estratégico. Responde a la pregunta: **"De todo el trabajo que teníamos disponible (lo antiguo pendiente + lo nuevo), ¿qué porcentaje logramos liquidar?"**. Mide la capacidad de manejar tanto la carga de trabajo nueva como el backlog acumulado.

### **Consulta SQL**

```sql
-- Usamos CTEs para que la lógica compleja sea fácil de seguir.
WITH period_output AS (
  -- Paso 1: Calcular el Numerador. Todo lo que se completó en el período.
  SELECT
    priority,
    COUNT(*) AS num_completed_in_period
  FROM tasks
  WHERE
    completed_at >= (CURRENT_DATE - INTERVAL '90 days')
  GROUP BY
    priority
),
period_workload AS (
  -- Paso 2: Calcular el Denominador. Todo el trabajo que estaba disponible en el período.
  SELECT
    priority,
    COUNT(*) AS total_available_tasks
  FROM tasks
  WHERE
    -- Condición: La tarea fue creada antes de que terminara el período Y no fue completada antes de que empezara.
    created_at < CURRENT_DATE
    AND (completed = false OR completed_at >= (CURRENT_DATE - INTERVAL '90 days'))
  GROUP BY
    priority
)
-- Paso 3: Unir y calcular el porcentaje final.
SELECT
  pw.priority AS "Prioridad",
  COALESCE(po.num_completed_in_period, 0) AS "Tareas Completadas en el Período",
  pw.total_available_tasks AS "Total Tareas Disponibles (Backlog + Nuevas)",
  (COALESCE(po.num_completed_in_period, 0)::DECIMAL * 100 / NULLIF(pw.total_available_tasks, 0)) AS "Tasa de Liquidación de Pendientes (%)"
FROM
  period_workload AS pw
LEFT JOIN
  period_output AS po ON pw.priority = po.priority;
```

#### **Formato de Salida Esperado**

| Prioridad | Tareas Completadas en el Período | Total Tareas Disponibles (Backlog + Nuevas) | Tasa de Liquidación de Pendientes (%) |
| :-------- | :------------------------------- | :------------------------------------------ | :------------------------------------ |
| `HIGH`    | `165`                            | `210`                                       | `78.57`                               |
| `MEDIUM`  | `410`                            | `580`                                       | `70.69`                               |
| `LOW`     | `255`                            | `400`                                       | `63.75`                               |

-----

### **Recomendación y Conclusión**

Si bien el término "tendencias diarias" podría sugerir el Enfoque 1, una interpretación más estratégica y alineada con el conjunto de las preguntas de negocio nos lleva a recomendar el **Enfoque 3: Tasa de Liquidación de Pendientes.**

La razón para esta elección es la **coherencia analítica**. Las preguntas posteriores, como la N°3 ("Rendimiento por Categoría") y la N°5 ("Análisis de Tareas Vencidas"), se centran claramente en medir la **eficiencia** y la **gestión del trabajo pendiente (backlog)**.

* El **Enfoque 1** nos dice *cuándo* se trabaja, midiendo el ritmo y el volumen de actividad. Es una métrica operacional.
* El **Enfoque 3** nos dice *qué tan efectivo* es ese trabajo para reducir la carga total, incluyendo la "deuda" de tareas antiguas. Es una métrica de **rendimiento estratégico**.

Al seleccionar el Enfoque 3, no solo respondemos a la pregunta de la tasa de completado, sino que también creamos una métrica que se conecta directamente con el análisis de rendimiento por categoría y la gestión de tareas vencidas, ofreciendo una visión más holística y profunda de la salud productiva del sistema. Mide la **capacidad real** de la organización para mantenerse al día, lo cual es un indicador de rendimiento superior.
