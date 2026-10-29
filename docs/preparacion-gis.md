# Preparación GIS

Estado: documentación para la Etapa 6. No hay mapa, marcadores ni Leaflet instalado.

## Intención

El visor va a representar estaciones y otras entidades geográficas sobre un mapa interactivo. El frontend consume geometrías ya validadas por el backend NestJS. El cliente no es la fuente de verdad de las coordenadas.

## Tecnologías previstas

- Leaflet y React Leaflet para el mapa.
- OpenStreetMap como cartografía base inicial.
- Carga en un Client Component. Leaflet usa `window` y no se renderiza en el servidor: `next/dynamic` con `ssr: false`, o un import dinámico equivalente.

## Responsabilidades

El mapa dibuja y notifica la selección. Las tablas, los filtros y la búsqueda viven fuera del mapa. Un estado compartido (por ejemplo el identificador de `recursoSeleccionado`) sincroniza ambas vistas. El componente del mapa no consulta la API por su cuenta si esa consulta ya está en un módulo o hook.

## Funciones previstas, no implementadas

- Marcadores a partir de geometrías del backend.
- Popups con atributos.
- Selección mapa ↔ tabla.
- Búsqueda por atributos y filtros.
- Ajuste de la vista a una entidad.
- Agrupación de marcadores si la densidad lo exige.

No se inventan coordenadas. Un punto que no venga validado del backend no se dibuja.

## OpenStreetMap

Los teselas públicos de `tile.openstreetmap.org` tienen política de uso. Sirven para desarrollo y para una carga baja. No son un servicio de producción ilimitado. En un despliegue institucional hay que evaluar un proveedor de teselas propio o un contrato. Toda vista del mapa debe conservar la atribución de OpenStreetMap y de quienes correspondan.

## Sistema de referencia

El backend documentará el SRID. El visor debe interpretar el mismo sistema, previsto `EPSG:4326` (WGS 84). Leaflet usa lon/lat en ese orden al crear un `LatLng`.
