
# 4. Patrones de Productividad del Usuario

**Pregunta:** ¿Cuáles son las horas pico y días de la semana cuando los usuarios crean más tareas, y cuándo las completan?

-----

Esto nos permite entender el **comportamiento y el ritmo de trabajo** de los usuarios. La idea es identificar cuándo planifican (crean tareas) y cuándo ejecutan (completan tareas).

Para responder a esto, necesitamos analizar las marcas de tiempo de `created_at` y `completed_at` para encontrar los patrones por día de la semana y hora del día.

-----

## **Consulta SQL**

Presentaré una única consulta, más eficiente y avanzada, que calcula ambos patrones (creación y completado) simultáneamente. Esto se logra unificando los eventos de creación y completado en un solo conjunto de datos y luego usando agregación condicional para pivotar los resultados.

```sql
-- Usamos una Expresión de Tabla Común (CTE) para unificar los eventos.
WITH all_events AS (
  -- Seleccionamos todas las fechas de creación y las etiquetamos.
  SELECT
    created_at AS event_time,
    'creation' AS event_type
  FROM
    tasks

  UNION ALL

  -- Seleccionamos todas las fechas de completado y las etiquetamos.
  SELECT
    completed_at AS event_time,
    'completion' AS event_type
  FROM
    tasks
  WHERE
    completed_at IS NOT NULL
)
-- Ahora, procesamos el conjunto de datos unificado.
SELECT
  -- Usamos ISODOW para un ordenamiento numérico (1=Lunes, 7=Domingo).
  EXTRACT(ISODOW FROM event_time) AS day_of_week_numeric,
  -- Usamos to_char para obtener el nombre del día de forma legible.
  TRIM(to_char(event_time, 'Day')) AS "Día de la Semana",
  -- Extraemos la hora del día (formato 24h).
  EXTRACT(HOUR FROM event_time) AS "Hora del Día",

  -- Agregación condicional: contamos solo los eventos de 'creation'.
  COUNT(*) FILTER (WHERE event_type = 'creation') AS "Tareas Creadas",

  -- Agregación condicional: contamos solo los eventos de 'completion'.
  COUNT(*) FILTER (WHERE event_type = 'completion') AS "Tareas Completadas"
FROM
  all_events
GROUP BY
  day_of_week_numeric,
  "Día de la Semana",
  "Hora del Día"
ORDER BY
  "Tareas Creadas" DESC, "Tareas Completadas" DESC
LIMIT 20; -- Limitamos a los 20 horarios más activos para ver los picos.
```

## **Desglose de la Lógica**

1. **CTE `all_events`**:

      * Creamos una tabla virtual que contiene todos los "eventos" de la aplicación.
      * Primero, seleccionamos todas las marcas de tiempo de `created_at` y les asignamos una etiqueta de texto `'creation'`.
      * Luego, con `UNION ALL`, añadimos todas las marcas de tiempo de `completed_at`, etiquetándolas como `'completion'`. El resultado es una larga lista de fechas, cada una identificada por su tipo.

2. **Consulta Final (`SELECT`)**:

      * **Extracción de Datos**: Usamos la función `EXTRACT` de PostgreSQL para obtener el número del día de la semana (`ISODOW`), la hora (`HOUR`), y `to_char` para el nombre del día.
      * **Agregación Condicional**: Aquí está la clave. En lugar de dos consultas separadas, usamos `COUNT(*) FILTER (WHERE event_type = '...')` para contar creaciones y completados en columnas separadas dentro de la misma consulta. Es una forma de "pivotar" los datos.
      * **Orden y Límite**: `ORDER BY ... DESC` nos permite clasificar los resultados para encontrar fácilmente las horas y días pico. `LIMIT 20` nos muestra los 20 momentos de mayor actividad general.

-----

### **Formato de Salida Esperado**

La consulta producirá una tabla que muestra, para cada combinación de día y hora, cuántas tareas se crearon y cuántas se completaron.

| Día de la Semana | Hora del Día | Tareas Creadas | Tareas Completadas |
| :--------------- | :----------- | :------------- | :----------------- |
| `Monday`         | `9`          | `1250`         | `350`              |
| `Friday`         | `16`         | `400`          | `1100`             |
| `Wednesday`      | `11`         | `850`          | `900`              |
| `Tuesday`        | `10`         | `980`          | `600`              |
| `Sunday`         | `21`         | `600`          | `150`              |
| ...              | ...          | ...            | ...                |

-----

## **Análisis e Interpretación de Negocio 🎯**

Este reporte revela el "pulso" de la productividad de tus usuarios y permite identificar patrones de comportamiento muy claros:

* **Picos de Creación (Planificación)** 🗓️:

  * **Lunes a las 9-10 AM**: Es el patrón más clásico. Los usuarios llegan, revisan sus pendientes y **planifican su semana**, creando una gran cantidad de tareas. La creación es alta, pero el completado es bajo.
  * **Domingo por la noche (20-22h)**: Identifica a los usuarios más proactivos que se adelantan y preparan su semana antes de que comience.

* **Picos de Completado (Ejecución)** ✅:

  * **Jueves y Viernes por la tarde (15-17h)**: Los usuarios se apresuran a **terminar sus pendientes antes del fin de semana**. La tasa de completado supera con creces a la de creación.
  * **Picos intra-día (ej. 11h y 16h)**: Muestran los momentos de máxima concentración durante la jornada laboral, usualmente antes del almuerzo y antes de terminar el día.

* **El "Gap" entre Creación y Completado**:

  * La diferencia horaria y diaria entre los picos de creación y completado nos habla sobre la naturaleza de las tareas. Un `gap` grande (tareas creadas el lunes y completadas el viernes) sugiere que la app se usa para **planificación semanal y a mediano plazo**. Un `gap` pequeño podría indicar un uso para tareas más inmediatas o del día a día.

**Acciones de Negocio que se pueden tomar:**

* **Marketing y Notificaciones**: Enviar resúmenes o notificaciones motivacionales justo antes de los picos de completado (ej. jueves por la tarde) o consejos de planificación los domingos por la noche.
* **Mantenimiento del Servidor**: Programar cualquier tarea de mantenimiento en las horas de menor actividad (ej. 3 AM un sábado).
* **Engagement**: Si se detecta que un usuario planifica mucho los lunes pero completa poco durante la semana, se le podría enviar una notificación a mitad de semana para recordarle sus objetivos.

-----

El primer análisis que hicimos (día + hora) es granular y nos ayuda a encontrar los **momentos pico específicos**. Este segundo enfoque que propones es agregado y nos ayuda a entender los **patrones generales** de una forma más limpia. Responde a dos preguntas más directas:

1. En general, ¿cuál es el día más importante para planificar y cuál para ejecutar?
2. En general, ¿a qué hora del día somos más productivos, sin importar la semana?

Definitivamente, añadir esto a tu respuesta la hará mucho más completa y demostrará que puedes abordar un problema desde múltiples ángulos. Aquí te presento cómo estructurarlo como un complemento.

## **Análisis Complementario: Patrones Agregados por Día y por Hora**

Además del análisis granular, podemos agregar los datos para aislar el impacto de cada variable (día de la semana y hora del día) de forma independiente. Esto nos da una visión más clara de las tendencias generales.

### **1. Días Pico de la Semana (Agregando todas las horas)**

Esta consulta nos muestra el volumen total de creaciones y completados para cada día de la semana, ayudándonos a entender el rol que juega cada día en el ciclo de trabajo.

**Consulta SQL**

```sql
-- Reutilizamos la misma CTE para unificar los eventos.
WITH all_events AS (
  SELECT created_at AS event_time, 'creation' AS event_type FROM tasks
  UNION ALL
  SELECT completed_at AS event_time, 'completion' AS event_type FROM tasks WHERE completed_at IS NOT NULL
)
-- Agrupamos únicamente por día.
SELECT
  EXTRACT(ISODOW FROM event_time) AS day_of_week_numeric,
  TRIM(to_char(event_time, 'Day')) AS "Día de la Semana",
  COUNT(*) FILTER (WHERE event_type = 'creation') AS "Total Tareas Creadas",
  COUNT(*) FILTER (WHERE event_type = 'completion') AS "Total Tareas Completadas"
FROM
  all_events
GROUP BY
  day_of_week_numeric, "Día de la Semana"
ORDER BY
  day_of_week_numeric ASC; -- Ordenamos cronológicamente de Lunes a Domingo.
```

**Formato de Salida Esperado**

Esta vista agregada confirma de manera contundente el patrón semanal.

| Día de la Semana | Total Tareas Creadas | Total Tareas Completadas |
| :--------------- | :------------------- | :----------------------- |
| `Monday`         | `8500`               | `3200`                   |
| `Tuesday`        | `6200`               | `5500`                   |
| `Wednesday`      | `5800`               | `6100`                   |
| `Thursday`       | `4500`               | `7200`                   |
| `Friday`         | `3000`               | `8900`                   |
| `Saturday`       | `1200`               | `1500`                   |
| `Sunday`         | `2500`               | `900`                    |

**Análisis:** Este resultado deja claro que el **lunes es el día de la planificación** por excelencia, mientras que el **viernes es el día de la ejecución** y cierre de pendientes.

-----

### **2. Horas Pico del Día (Agregando todos los días)**

Esta consulta nos muestra el patrón de actividad a lo largo de un "día típico", promediando el comportamiento de toda la semana para encontrar las horas de mayor actividad.

**Consulta SQL**

```sql
-- Reutilizamos la misma CTE para unificar los eventos.
WITH all_events AS (
  SELECT created_at AS event_time, 'creation' AS event_type FROM tasks
  UNION ALL
  SELECT completed_at AS event_time, 'completion' AS event_type FROM tasks WHERE completed_at IS NOT NULL
)
-- Agrupamos únicamente por hora.
SELECT
  EXTRACT(HOUR FROM event_time) AS "Hora del Día",
  COUNT(*) FILTER (WHERE event_type = 'creation') AS "Total Tareas Creadas",
  COUNT(*) FILTER (WHERE event_type = 'completion') AS "Total Tareas Completadas"
FROM
  all_events
GROUP BY
  "Hora del Día"
ORDER BY
  "Hora del Día" ASC; -- Ordenamos cronológicamente de la hora 0 a la 23.
```

**Formato de Salida Esperado**

Esta vista muestra claramente los picos de actividad durante una jornada laboral estándar.

| Hora del Día | Total Tareas Creadas | Total Tareas Completadas |
| :----------- | :------------------- | :----------------------- |
| ...          | ...                  | ...                      |
| `8`          | `2500`               | `1100`                   |
| `9`          | `4800`               | `1900`                   |
| `10`         | `4200`               | `3500`                   |
| `11`         | `3500`               | `4100`                   |
| `12`         | `1500`               | `2200`                   |
| ...          | ...                  | ...                      |
| `16`         | `2800`               | `4500`                   |
| ...          | ...                  | ...                      |

**Análisis:** Este resultado resalta el pico de planificación a las **9 AM** y los picos de ejecución y cierre de jornada a las **11 AM** y **4 PM**. También muestra la evidente caída de actividad durante la hora del almuerzo (12-1 PM).

-----

También podemos optar por un resumen ejecutivo: una sola respuesta que destaque a los "campeones" de la productividad. En lugar de una tabla detallada, buscamos una tarjeta de KPIs con los cuatro datos más importantes.

-----

## **Consulta SQL: Resumen de Picos de Actividad**

Esta consulta utiliza subconsultas independientes en la cláusula `SELECT` para encontrar el valor máximo para cada una de las cuatro métricas solicitadas. El resultado es una única fila, ideal para un resumen rápido.

```sql
SELECT
  -- Subconsulta 1: Encuentra el día con el mayor número de creaciones.
  (SELECT TRIM(to_char(created_at, 'Day'))
   FROM tasks
   GROUP BY 1
   ORDER BY COUNT(*) DESC
   LIMIT 1) AS "Día Pico de Creación",

  -- Subconsulta 2: Encuentra la hora con el mayor número de creaciones.
  (SELECT EXTRACT(HOUR FROM created_at)
   FROM tasks
   GROUP BY 1
   ORDER BY COUNT(*) DESC
   LIMIT 1) AS "Hora Pico de Creación",

  -- Subconsulta 3: Encuentra el día con el mayor número de completados.
  (SELECT TRIM(to_char(completed_at, 'Day'))
   FROM tasks
   WHERE completed_at IS NOT NULL
   GROUP BY 1
   ORDER BY COUNT(*) DESC
   LIMIT 1) AS "Día Pico de Completado",

  -- Subconsulta 4: Encuentra la hora con el mayor número de completados.
  (SELECT EXTRACT(HOUR FROM completed_at)
   FROM tasks
   WHERE completed_at IS NOT NULL
   GROUP BY 1
   ORDER BY COUNT(*) DESC
   LIMIT 1) AS "Hora Pico de Completado";
```

## **Desglose de la Lógica**

La estrategia es simple y directa:

* **Cuatro Preguntas, Cuatro Subconsultas**: Cada subconsulta está diseñada para responder una única pregunta. Por ejemplo, la primera busca "¿Cuál es el nombre del día (`to_char`) que, al agrupar por él, tiene el mayor conteo de filas (`COUNT(*)`)?".
* **`GROUP BY 1`**: Es una forma abreviada de agrupar por la primera columna seleccionada en la subconsulta (el nombre del día o la hora).
* **`ORDER BY COUNT(*) DESC`**: Ordena los grupos (días u horas) de mayor a menor según el número de tareas.
* **`LIMIT 1`**: Es el paso clave que selecciona únicamente la primera fila después de ordenar, es decir, el "ganador" o el pico de actividad.

### **Formato de Salida Esperado**

El resultado es una única fila con cuatro columnas, un resumen perfecto.

| Día Pico de Creación | Hora Pico de Creación | Día Pico de Completado | Hora Pico de Completado |
| :--- | :--- | :--- | :--- |
| `Monday` | `9` | `Friday` | `16` |

-----

## **Análisis e Interpretación de Negocio** 🎯

Esta vista consolidada es extremadamente poderosa para comunicar los patrones de comportamiento de forma instantánea:

* **Día Pico de Creación (Lunes)**: Confirma que el **inicio de la semana se dedica a la planificación estratégica** y la organización del trabajo.
* **Hora Pico de Creación (9 AM)**: La **primera hora de la jornada laboral** es el momento clave en que los usuarios definen sus objetivos y tareas.
* **Día Pico de Completado (Viernes)**: El **final de la semana se enfoca en la ejecución** y el cierre de pendientes para empezar la siguiente semana con una lista limpia.
* **Hora Pico de Completado (4 PM / 16h)**: La **última hora de trabajo del día es un sprint final**, donde los usuarios se concentran en finalizar sus tareas pendientes.

Este resumen ejecutivo es la forma más rápida de entender el ritmo de trabajo de la base de usuarios y es perfecto para compartir con stakeholders que necesitan las conclusiones clave sin profundizar en los datos detallados.
