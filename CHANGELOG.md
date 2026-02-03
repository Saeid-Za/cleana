# Changelogs

## v2.1.0

[compare changes](https://github.com/Saeid-Za/cleana/compare/v2.0.0...v2.1.0)

### 🚀 Enhancements

- Add circular reference handling option ([b9797ee](https://github.com/Saeid-Za/cleana/commit/b9797ee))


### ❤️ Contributors

- Saeid Zareie <saeid.za98@gmail.com>

## v2.0.0

[compare changes](https://github.com/Saeid-Za/cleana/compare/v1.1.1...v2.0.0)

Major release: benchmarks show significantly improved throughput and **memory usage cut in half**, plus better Date handling in `removeValues` and a leaner ESM-only build. **If you use CommonJS (`require()`), you must migrate to ESM or use a bundler**—see breaking changes below.

### ⚠️ Breaking changes

- **CJS support removed.** The package now ships only ESM (`import`). If you use `require("cleana")` or run in a CJS-only environment (e.g. some Node scripts without `"type": "module"`), switch to `import { cleana } from "cleana"` and ensure your project supports ESM, or bundle cleana with your app.

### 🔥 Performance

- Apply additional optimizations to improve overall performance ([52bd8df](https://github.com/Saeid-Za/cleana/commit/52bd8df)); benchmarks show higher throughput and ~50% lower memory usage

### 🩹 Fixes

- Enhance deepEqual function to correctly compare Date objects ([9fa0b14](https://github.com/Saeid-Za/cleana/commit/9fa0b14))

### 💅 Refactors

- Optimize cleana normalization by introducing shared constants for default configurations ([2a802af](https://github.com/Saeid-Za/cleana/commit/2a802af))
- Update normalize and cleana functions to accept optional options parameter ([108e27d](https://github.com/Saeid-Za/cleana/commit/108e27d))

### 🏡 Chore

- GitHub Actions CI ([96bdc75](https://github.com/Saeid-Za/cleana/commit/96bdc75))
- Update dependencies ([2498a8a](https://github.com/Saeid-Za/cleana/commit/2498a8a))
- Adding custom benchmark scripts ([0336ec1](https://github.com/Saeid-Za/cleana/commit/0336ec1))

### ✅ Tests

- Add test suites for edge cases ([b78c71b](https://github.com/Saeid-Za/cleana/commit/b78c71b))
- Enhance cleana test suite with detailed cases for root values, default cleaning, options, and nested structures ([37aa8f8](https://github.com/Saeid-Za/cleana/commit/37aa8f8))

### ❤️ Contributors

- Saeid Zareie <saeid.za98@gmail.com>

## v1.1.1

[compare changes](https://github.com/Saeid-Za/cleana/compare/v1.1.0...v1.1.1)

### 🩹 Fixes

- Prototype checking to handle dates ([01fd1b1](https://github.com/Saeid-Za/cleana/commit/01fd1b1))

### ❤️ Contributors

- Saeid Zareie <saeid.za98@gmail.com>

## v1.1.0

[compare changes](https://github.com/Saeid-Za/cleana/compare/v1.0.0...v1.1.0)

### 🚀 Enhancements

- Adding `removeValues` option ([2de407d](https://github.com/Saeid-Za/cleana/commit/2de407d))

### 🏡 Chore

- Update deps ([e235c3c](https://github.com/Saeid-Za/cleana/commit/e235c3c))

### ❤️ Contributors

- Saeid Zareie <saeid.za98@gmail.com>


## v1.0.0

### 🚀 Enhancements
- Init Project

### ❤️ Contributors

- Saeid Zareie <saeid.za98@gmail.com>

