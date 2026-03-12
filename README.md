

# Calculadora de fuego Mortero mk252 ARMA3

Pequeña app realizada en React para la 42RTF para realizar y preparar los calculos de tiro para el mortero de la seccion de Hermes

Poco mas que un form y un reducer

- [Calculadora de fuego Mortero mk256 ARMA3](#calculadora-de-fuego-mortero-mk256-arma3)
- [Instalacion](#instalacion)
- [Manejo](#manejo)
- [Repositorio](#repositorio)
- [Observaciones](#observaciones)


# Instalacion

Requiere Nodejs, v20 o superior
Descomprimir en un directorio y desde una terminal hacer cd a ese directorio e instalar dependencias

```
npm install
```

Para ejecutarlo

```
npm start
```

# Manejo
Seleccionar el tipo de municion e insertar los parametros y pulsar en el boton Calcular

# Repositorio
https://github.com/juanan-martin-lpz/arma-mk252-mortar.git

# Observaciones
Las tablas han sido generadas a partir de las imagenes capturadas del juego e interpretadas por ChatGPT por lo que es posible que tenga algun fallo. Han sido generadas las de las municiones CH0, CH1 y CH2.
No se han generado las tablas para otros tipos de proyectiles, pero es facil su creacion e integracion.
Para los valerosos les dejo la tarea de insertar la columna de tiempo de vuelo de dichas tablas e insertar una columna para tener asi el ETA aproximado de impacto
Como tarea adicional a esa podeis buscar un algoritmo basado en el ETA de impacto para que os recomiende la mejor municion.
No se borran los parametros al darle al boton Calcular asi que si estais poniendo un identificador de objetivo y no lo corregis os saldrá igual


