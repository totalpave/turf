import node from 'rollup-plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import commonjs from 'rollup-plugin-commonjs';
import {rollup} from 'rollup';

const input = 'index.js';
const plugins = [commonjs(), node(), terser()];
const format = 'cjs';

rollup({input, plugins})
    .catch(catchError)
    .then(generate);

function generate(value) {
    value.generate({format})
        .catch(catchError);
}

function catchError(e) {
    throw new Error(e);
}
