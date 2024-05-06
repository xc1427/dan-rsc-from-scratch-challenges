import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// Replace './node-jsx-loader.js' with the correct path to your loader if necessary
const loaderPath = './node-jsx-loader.js';

// Use `register` to include your custom loader
register(loaderPath, pathToFileURL(loaderPath));