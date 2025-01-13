# 🧼 Cleana

Clean JavaScript Objects and Arrays, recursively. Lightweight and Fast.

[![npm version](https://img.shields.io/npm/v/cleana?color=yellow)](https://npmjs.com/package/cleana)
[![npm downloads](https://img.shields.io/npm/dm/cleana?color=yellow)](https://npm.chart.dev/cleana)

Cleana efficiently sanitize both JavaScript Objects and Arrays by removing unwanted values such as `undefined`, `NaN`, empty objects `{}` and empty arrays `[]`.

## Install

Install package:

```sh
npm install cleana
```
## Usage

```ts
import { cleana } from "cleana"

const input = {
	array: [],
	object: {},
	string: "",
	nan: Number.NaN,
	und: undefined,
	value: "123",
	nested: {
		arr: ["", [], {}],
		obj: { key: {}, key2: [] },
		nestedValue: "456"
	}
}

const output = cleana(input)

/*
{
  value: "123",
  nested: {
    nestedValue: "456"
  }
}
*/
```

## Configuration

Cleana takes argument object of type `CleanaOptions`:

| Option           | Type       | Description                                                                                                              | Default |
| ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------ | ------- |
| `cleanArray`     | `boolean`  | Remove empty arrays, e.g., `[]`                                                                                          | `true`  |
| `cleanObject`    | `boolean`  | Remove empty objects, e.g., `{}`                                                                                         | `true`  |
| `cleanNull`      | `boolean`  | Remove null values                                                                                                       | `true`  |
| `cleanUndefined` | `boolean`  | Remove undefined values                                                                                                  | `true`  |
| `cleanString`    | `boolean`  | Remove empty strings, e.g., `""`                                                                                         | `true`  |
| `cleanNaN`       | `boolean`  | Remove NaN values                                                                                                        | `true`  |
| `removeKeys`     | `string[]` | Forcefully remove keys, e.g., `["key1", "key2"]`                                                                         | `[]`    |
| `removeValues`   | `any[]`    | Forcefully remove values, ie: ["someString", 123, false, `{key: "123"}`], using the `fast-deep-equal` to check equality. | `[]`    |
| `inPlace`        | `boolean`  | Create a new object that is cleaned or mutate the object passed to it & clean in place                                   | `false` |

## What makes this library unique

Cleana is built on the work of [`fast-clean`](https://github.com/Youssef93/fast-clean), [`clean-deep`](https://github.com/nunofgs/clean-deep). [`deep-cleaner`](https://github.com/darksinge/deep-cleaner) and [`obj-clean`](https://www.npmjs.com/package/obj-clean).

**Faster and More Efficient**
<br>
Cleana is designed to be quicker than its predecessors.

![Benchmark for small-sized json](./assets/benchmark-small.png)

Benchmark code is located [here](https://github.com/Saeid-Za/cleana/tree/main/benchmark).

**All-in-One Features**
<br>
Cleana combines the best functionalities from the libraries mentioned above. This means you get a set of tools for cleaning JavaScript objects all in one place.

**Lightweight and fully tested**
<br>
Cleana has no external dependencies. Its lightweight design helps keep your application running without unnecessary bloat. Cleana is around `1 KB` when Gzipped, and has `100%` test coverage.

---
This benchmark runs against the available test cases, It is recommended to benchmark against your data using the benchmark source code.

## Examples

Do not Clean null Values
```ts
const options: CleanaOptions = { cleanNull: false }
const input = { a: Number.NaN, b: null, c: "", d: 42 }

cleana(input, options)
// { d: 42, b: null }
```
Remove Specefic keys

```ts
const input = { a: { b: { c: 1, d: 2, e: 3 }, e: 5 } }
const options = { removeKeys: ["e", "c"] }

cleana(input, options)
// { a: { b: { d: 2 } } }
```

Remove Specefic values
```ts
const input = { a: { b: { c: 1, d: 2, e: 3, u: "55", g: false }, e: 5 }, v: { g: 100 } }
const options = { removeValues: [1, 3, false, "55", { g: 100 }] }

cleana(input, options)
// { a: { b: { d: 2 }, e: 5 } }
```

Clean in-place
```ts
const input = { a: null, b: Number.NaN, c: "", d: 42 }
const options = { inPlace: true }

cleana(input, options)
// input is equal to `{d: 42}`
```

## Development

<details>

<summary>Local Development</summary>

- Clone this repository
- Install latest LTS version of [Node.js](https://nodejs.org/en/)
- Install dependencies using `bun install`
- Run interactive tests using `bun dev`

</details>

## License

<!-- automd:contributors license=MIT -->

Published under the [MIT](https://github.com/Saeid-Za/cleana/blob/main/LICENSE) license.
Made by [community](https://github.com/Saeid-Za/cleana/graphs/contributors) 💛
<br><br>
<a href="https://github.com/Saeid-Za/cleana/graphs/contributors">
<img src="https://contrib.rocks/image?repo=Saeid-Za/cleana" />
</a>

<!-- /automd -->
