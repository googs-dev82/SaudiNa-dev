import { schemaTypes } from "./src/sanity/schemaTypes/index.ts";
schemaTypes.forEach(t => console.log(typeof t === 'function' ? t.name : t.name));
