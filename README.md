# rollup-plugin-node-resolve-auto

Fork of [rollup-plugin-node-resolve](https://github.com/rollup/rollup-plugin-node-resolve) that
does the thing I usually want Rollup to do, which is:

1. Bundle first-party ES6 modules
2. Treat third-party dependencies as external CommonJS
3. ..._unless_ those third-party deps declare a `"jsnext:main"` or `"module"` in their `package.json`.

The only options that this plugin shares with `rollup-plugin-node-resolve` are `"browser"` and `"extension"`.

## Installation

```bash
npm install --save-dev rollup-plugin-node-resolve-auto
```

## Usage

```js
import { rollup } from 'rollup';
import nodeResolve from 'rollup-plugin-node-resolve';

rollup({
  entry: 'main.js',
  plugins: [
    nodeResolve({
      // If you set this to true, then modules will be built in "browser" mode
      // based on the presence of the "browser" field in package.json
      browser: true,  // Default: false

      // not all files you want to resolve are .js or .json files
      // if you want to support .json, you'll also need rollup-plugin-json
      extensions: [ '.js', '.json' ]  // Default: ['.js']
    })
  ]
}).then( bundle => bundle.write({ dest: 'bundle.js', format: 'iife' }) );
```

## License

MIT
