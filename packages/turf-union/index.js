import { GeoJSONReader, GeoJSONWriter, UnionOp } from 'turf-jsts';

/**
 * Takes two or more {@link Polygon|polygons} and returns a combined polygon. If the input polygons are not contiguous, this function returns a {@link MultiPolygon} feature.
 *
 * @name union
 * @param {...Feature<Polygon>} A polygon to combine
 * @returns {Feature<(Polygon|MultiPolygon)>} a combined {@link Polygon} or {@link MultiPolygon} feature
 * @example
 * var poly1 = turf.polygon([[
 *     [-82.574787, 35.594087],
 *     [-82.574787, 35.615581],
 *     [-82.545261, 35.615581],
 *     [-82.545261, 35.594087],
 *     [-82.574787, 35.594087]
 * ]], {"fill": "#0f0"});
 * var poly2 = turf.polygon([[
 *     [-82.560024, 35.585153],
 *     [-82.560024, 35.602602],
 *     [-82.52964, 35.602602],
 *     [-82.52964, 35.585153],
 *     [-82.560024, 35.585153]
 * ]], {"fill": "#00f"});
 *
 * var union = turf.union(poly1, poly2);
 *
 * //addToMap
 * var addToMap = [poly1, poly2, union];
 */
function union(...args) {
    const reader = new GeoJSONReader();
    let result = reader.read(JSON.stringify(args[0].geometry));

    for (let i = 1; i < args.length; i++) {
        result = UnionOp.union(result, reader.read(JSON.stringify(args[i].geometry)));
    }

    const writer = new GeoJSONWriter();
    result = writer.write(result);

    return {
        type: 'Feature',
        geometry: result,
        properties: args[0].properties
    };
}

export default union;
