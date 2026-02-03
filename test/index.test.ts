import type { CleanaOptions } from "../src"
import { describe, expect, it } from "vitest"
import { cleana } from "../src"

describe("cleana", () => {
	// ─── Root & primitives ─────────────────────────────────────────────────────
	describe("root & primitives", () => {
		it("returns null/undefined at root unchanged", () => {
			expect(cleana(null)).toBe(null)
			expect(cleana(undefined)).toBe(undefined)
		})

		it("returns non-null primitives at root unchanged", () => {
			expect(cleana(1)).toBe(1)
			expect(cleana(0)).toBe(0)
			expect(cleana(false)).toBe(false)
			expect(cleana("str")).toBe("str")
			expect(cleana("")).toBe("")
			expect(cleana(Number.NaN)).toBe(Number.NaN)
		})

		it("returns root empty object as {}", () => {
			expect(cleana({})).toEqual({})
		})

		it("returns root object with only empty values as {}", () => {
			expect(cleana({ a: null, b: "", c: Number.NaN, d: [] })).toEqual({})
		})

		it("root object never disappears (returns {} instead of SKIP)", () => {
			expect(cleana({ a: null })).toEqual({})
		})

		it("returns root array (may become empty)", () => {
			expect(cleana([])).toEqual([])
			expect(cleana([null, "", Number.NaN])).toEqual([])
		})
	})

	// ─── Default cleaning ───────────────────────────────────────────────────────
	describe("default cleaning", () => {
		it("removes null, NaN, empty string, undefined, empty array, empty object", () => {
			const input = { a: null, b: Number.NaN, c: "", d: undefined, e: [], f: {}, g: 42 }
			expect(cleana(input)).toEqual({ g: 42 })
		})

		it("does not treat 0 or false as empty", () => {
			const input = { a: 0, b: false, c: "", d: null, e: Number.NaN }
			expect(cleana(input)).toEqual({ a: 0, b: false })
		})
	})

	// ─── Options (clean* flags) ────────────────────────────────────────────────
	describe("options", () => {
		it("cleanNull=false keeps null", () => {
			const ops: CleanaOptions = { cleanNull: false }
			expect(cleana({ a: null, b: "", c: 1 }, ops)).toEqual({ a: null, c: 1 })
		})

		it("cleanUndefined=false keeps undefined in objects and arrays", () => {
			const ops: CleanaOptions = { cleanUndefined: false }
			expect(cleana({ a: undefined, b: [undefined, null, 1] }, ops)).toEqual({ a: undefined, b: [undefined, 1] })
		})

		it("cleanNaN=false keeps NaN", () => {
			const ops: CleanaOptions = { cleanNaN: false }
			const out = cleana({ a: Number.NaN, b: 1 }, ops) as any
			expect(Number.isNaN(out.a)).toBe(true)
			expect(out.b).toBe(1)
		})

		it("cleanString=false keeps empty string", () => {
			const ops: CleanaOptions = { cleanString: false }
			expect(cleana({ a: "", b: null, c: 1 }, ops)).toEqual({ a: "", c: 1 })
		})

		it("cleanArray=false keeps empty arrays (still cleans contents)", () => {
			const ops: CleanaOptions = { cleanArray: false }
			expect(cleana({ a: [], b: [null], c: 1 }, ops)).toEqual({ a: [], b: [], c: 1 })
		})

		it("cleanObject=false keeps empty objects (still cleans contents)", () => {
			const ops: CleanaOptions = { cleanObject: false }
			expect(cleana({ a: {}, b: { c: null }, d: 1 }, ops)).toEqual({ a: {}, b: {}, d: 1 })
		})

		it("inPlace=true mutates original references", () => {
			const input: any = { a: null, b: [1, null, 2], c: { d: "", e: 1 } }
			const out = cleana(input, { inPlace: true })
			expect(out).toBe(input)
			expect(input).toEqual({ b: [1, 2], c: { e: 1 } })
		})

		it("all clean* false: keeps all empty-like values except removeKeys/removeValues", () => {
			const ops: CleanaOptions = {
				cleanNull: false,
				cleanUndefined: false,
				cleanString: false,
				cleanNaN: false,
				cleanArray: false,
				cleanObject: false,
			}
			const input = { a: null, b: undefined, c: "", d: Number.NaN, e: [], f: {} }
			expect(cleana(input, ops)).toEqual({ a: null, b: undefined, c: "", d: Number.NaN, e: [], f: {} })
		})
	})

	// ─── Nested structures ──────────────────────────────────────────────────────
	describe("nested structures", () => {
		it("cleans nested objects and arrays (non-inPlace)", () => {
			const input = {
				a: null,
				b: Number.NaN,
				c: "",
				d: {
					e: 42,
					gg: {},
					cc: [],
					hh: {},
					f: "",
					g: [1, 2, null],
					h: {
						i: Number.NaN,
						j: "Hello",
						k: [{ s: 2, b: "", z: [1, 2, 3, "", null, [], {}] }],
					},
				},
			}
			const expected = {
				d: {
					e: 42,
					g: [1, 2],
					h: {
						j: "Hello",
						k: [{ s: 2, z: [1, 2, 3] }],
					},
				},
			}
			expect(cleana(input)).toEqual(expected)
		})

		it("cleans nested structures (inPlace)", () => {
			const input: any = {
				a: null,
				b: Number.NaN,
				c: "",
				d: {
					e: 42,
					gg: {},
					cc: [],
					f: "",
					g: [1, 2, null],
					h: { i: Number.NaN, j: "Hello", k: [{ s: 2, b: "", z: [1, 2, 3, "", null, [], {}] }] },
				},
			}
			const expected = {
				d: {
					e: 42,
					g: [1, 2],
					h: { j: "Hello", k: [{ s: 2, z: [1, 2, 3] }] },
				},
			}
			expect(cleana(input, { inPlace: true })).toEqual(expected)
			expect(input).toEqual(expected)
		})

		it("drops nested empty arrays/objects when enabled", () => {
			const input = { a: { b: { c: [] } }, d: { e: {} }, keep: { x: 1 } }
			expect(cleana(input)).toEqual({ keep: { x: 1 } })
		})

		it("keeps nested empty arrays/objects when cleanArray/cleanObject=false", () => {
			const input = { a: { b: { c: [] } }, d: { e: {} } }
			const out = cleana(input, { cleanArray: false, cleanObject: false })
			expect(out).toEqual({ a: { b: { c: [] } }, d: { e: {} } })
		})

		it("handles very deep nesting", () => {
			const input = { a: { b: { c: { d: { e: null, f: 1 } } } } }
			expect(cleana(input)).toEqual({ a: { b: { c: { d: { f: 1 } } } } })
		})
	})

	// ─── removeKeys ─────────────────────────────────────────────────────────────
	describe("removeKeys", () => {
		it("removes keys at all nesting levels", () => {
			const input = { a: 1, secret: "x", nested: { secret: "y", keep: 1 }, arr: [{ secret: "z", ok: 1 }] }
			expect(cleana(input, { removeKeys: ["secret"] })).toEqual({ a: 1, nested: { keep: 1 }, arr: [{ ok: 1 }] })
		})

		it("removes keys inPlace and mutates original", () => {
			const input: any = { a: 1, secret: "x", nested: { secret: "y", keep: 1 } }
			const out = cleana(input, { removeKeys: ["secret"], inPlace: true })
			expect(out).toBe(input)
			expect(input).toEqual({ a: 1, nested: { keep: 1 } })
		})

		it("removing last keys drops nested object", () => {
			expect(cleana({ a: { secret: 1 } }, { removeKeys: ["secret"] })).toEqual({})
		})

		it("empty removeKeys does nothing extra", () => {
			const input = { a: null, b: 1 }
			expect(cleana(input, { removeKeys: [] })).toEqual({ b: 1 })
		})

		it("removeKeys with non-existent key does not break", () => {
			const input = { a: 1, b: 2 }
			expect(cleana(input, { removeKeys: ["missing"] })).toEqual({ a: 1, b: 2 })
		})

		it("removeKeys with multiple keys removes all", () => {
			const input = { a: 1, b: 2, c: 3, d: 4 }
			expect(cleana(input, { removeKeys: ["a", "c"] })).toEqual({ b: 2, d: 4 })
		})
	})

	// ─── removeValues ───────────────────────────────────────────────────────────
	describe("removeValues", () => {
		it("removes primitives by strict equality", () => {
			const input = { a: 1, b: 2, c: "x", d: false, e: null, f: "55" }
			expect(cleana(input, { removeValues: [1, "x", false, null, "55"] })).toEqual({ b: 2 })
		})

		it("removes objects by deep equality", () => {
			const input = { a: { k: 1 }, b: { k: 2 }, c: [{ x: 1 }, { x: 2 }] }
			expect(cleana(input, { removeValues: [{ k: 1 }, { x: 1 }] })).toEqual({ b: { k: 2 }, c: [{ x: 2 }] })
		})

		it("removes values inPlace", () => {
			const input: any = { a: [1, "55", true], b: { c: 1, d: 2, e: "55" } }
			const out = cleana(input, { inPlace: true, removeValues: [1, "55"] })
			expect(out).toBe(input)
			expect(input).toEqual({ a: [true], b: { d: 2 } })
		})

		it("removing last items drops nested array when cleanArray=true", () => {
			expect(cleana({ a: [1] }, { removeValues: [1] })).toEqual({})
		})

		it("removeValues is applied before primitive cleaning", () => {
			expect(cleana({ a: "", b: 1 }, { cleanString: false, removeValues: [""] })).toEqual({ b: 1 })
		})

		it("empty removeValues does nothing extra", () => {
			const input = { a: null, b: 1 }
			expect(cleana(input, { removeValues: [] })).toEqual({ b: 1 })
		})

		it("removeValues with NaN removes NaN (deep/strict)", () => {
			const input = { a: Number.NaN, b: 1 }
			const out = cleana(input, { cleanNaN: false, removeValues: [Number.NaN] }) as any
			expect(out).toEqual({ b: 1 })
			expect("a" in out).toBe(false)
		})
	})

	// ─── removeKeys + removeValues combo ────────────────────────────────────────
	describe("removeKeys + removeValues", () => {
		it("applies both: keys removed and values removed", () => {
			const input = { dropKey: 1, a: "remove", b: 2 }
			expect(cleana(input, { removeKeys: ["dropKey"], removeValues: ["remove"] })).toEqual({ b: 2 })
		})
	})

	// ─── Structural sharing (non-inPlace) ───────────────────────────────────────
	describe("structural sharing", () => {
		it("returns same reference when nothing changes (plain objects)", () => {
			const input = { a: 1, b: { c: 2 }, d: [3, 4] }
			const out: any = cleana(input)
			expect(out).toBe(input)
			expect(out.b).toBe(input.b)
			expect(out.d).toBe(input.d)
		})

		it("returns new object only for changed branches", () => {
			const input = { a: 1, b: { c: null, d: 2 }, e: { f: 3 } }
			const out: any = cleana(input)
			expect(out).not.toBe(input)
			expect(out.b).not.toBe(input.b)
			expect(out.b).toEqual({ d: 2 })
			expect(out.e).toBe(input.e)
		})

		it("returns new array only when contents change", () => {
			const input = { a: [1, 2, 3], b: [1, null, 2] }
			const out: any = cleana(input)
			expect(out.a).toBe(input.a)
			expect(out.b).not.toBe(input.b)
			expect(out.b).toEqual([1, 2])
		})

		it("class instances always materialize to POJO (no reference reuse)", () => {
			class Sample {
				x = 1
			}
			const sample = new Sample()
			const out: any = cleana(sample)
			expect(out).not.toBe(sample)
			expect(out instanceof Sample).toBe(false)
			expect(out).toEqual({ x: 1 })
		})
	})

	// ─── Special values & non-record objects ────────────────────────────────────
	describe("special values", () => {
		it("keeps Date instances intact", () => {
			const date = new Date()
			expect(cleana(date)).toBe(date)
			expect(cleana({ date })).toEqual({ date })
		})

		it("keeps Map, Set, RegExp intact", () => {
			const map = new Map([["a", 1]])
			const set = new Set([1, 2])
			const re = /x/g
			const input: any = { map, set, re, bad: null }
			const out: any = cleana(input)
			expect(out.map).toBe(map)
			expect(out.set).toBe(set)
			expect(out.re).toBe(re)
			expect("bad" in out).toBe(false)
		})

		it("preserves Error objects", () => {
			const err = new Error("x")
			const input: any = { err, bad: null }
			const out: any = cleana(input)
			expect(out.err).toBe(err)
			expect("bad" in out).toBe(false)
		})

		it("keeps BigInt", () => {
			expect(cleana({ a: 1n, b: null })).toEqual({ a: 1n })
		})

		it("keeps functions and symbols", () => {
			const fn = () => 1
			const sym = Symbol("x")
			const input: any = { fn, sym, bad: null }
			const out: any = cleana(input)
			expect(out.fn).toBe(fn)
			expect(out.sym).toBe(sym)
			expect("bad" in out).toBe(false)
		})

		it("keeps -0, Infinity, -Infinity; removes NaN", () => {
			const input = { a: -0, b: Infinity, c: -Infinity, d: Number.NaN, e: null }
			const out: any = cleana(input)
			expect(Object.is(out.a, -0)).toBe(true)
			expect(out.b).toBe(Infinity)
			expect(out.c).toBe(-Infinity)
			expect("d" in out).toBe(false)
			expect("e" in out).toBe(false)
		})
	})

	// ─── Edge cases ─────────────────────────────────────────────────────────────
	describe("edge cases", () => {
		describe("sparse arrays", () => {
			it("non-inPlace: holes are skipped, kept elements cleaned", () => {
				const arr = Array.from({ length: 5 })
				arr[1] = null
				arr[3] = 1
				expect(cleana(arr as any)).toEqual([1])
			})

			it("inPlace: compacts and mutates", () => {
				const arr: any = Array.from({ length: 5 })
				arr[1] = null
				arr[3] = 1
				const out = cleana(arr, { inPlace: true })
				expect(out).toBe(arr)
				expect(arr).toEqual([1])
			})
		})

		describe("null-prototype objects (Object.create(null))", () => {
			it("null-prototype object (non-inPlace)", () => {
				const obj = Object.create(null) as any
				obj.a = null
				obj.b = 1
				expect(cleana(obj)).toEqual({ b: 1 })
			})

			it("null-prototype object (inPlace)", () => {
				const obj = Object.create(null) as any
				obj.a = null
				obj.b = 1
				const out = cleana(obj, { inPlace: true })
				expect(out).toBe(obj)
				expect(obj).toEqual({ b: 1 })
			})
		})

		describe("class instances", () => {
			it("cleans into POJO (non-inPlace)", () => {
				class Sample {
					str: string | null = null
					date = new Date()
					obj: Record<string, any> = { a: null, b: 1 }
					arr: any[] = [1, "55", undefined, false, null]
				}
				const sample = new Sample()
				const out: any = cleana(sample)
				expect(out instanceof Sample).toBe(false)
				expect(out).toEqual({
					date: sample.date,
					obj: { b: 1 },
					arr: [1, "55", false],
				})
			})

			it("inPlace mutates the instance", () => {
				class Sample {
					a: any = null
					b: any = 1
				}
				const sample: any = new Sample()
				const out = cleana(sample, { inPlace: true })
				expect(out).toBe(sample)
				expect(sample).toEqual({ b: 1 })
			})
		})

		it("root array with only empty values becomes []", () => {
			expect(cleana([null, "", undefined, Number.NaN, [], {}])).toEqual([])
		})

		it("root array with mixed values (inPlace) mutates and compacts", () => {
			const input: any = [Number.NaN, "", { a: 1, b: [{}, [], { g: [{ a: 123, c: [] }] }] }, null]
			const expected = [{ a: 1, b: [{ g: [{ a: 123 }] }] }]
			expect(cleana(input, { inPlace: true })).toEqual(expected)
			expect(input).toEqual(expected)
		})

		it("single-element array that is removed drops array", () => {
			expect(cleana({ a: [null] })).toEqual({})
		})

		it("typed arrays are preserved (not traversed)", () => {
			const buf = new Uint8Array([1, 2, 3])
			expect(cleana(buf)).toBe(buf)
			expect(cleana({ buf, x: null })).toEqual({ buf })
		})

		it("empty options does not crash", () => {
			expect(cleana({ a: 1 }, {} as any)).toEqual({ a: 1 })
		})
	})

	// ─── Internal / coverage (stash paths) ──────────────────────────────────────
	describe("internal coverage (stash paths)", () => {
		it("materializes output via stash overflow (>4 unchanged keys) before first change", () => {
			const input = {
				k1: 1,
				k2: 2,
				k3: 3,
				k4: 4,
				k5: 5,
				drop: null,
			}
			const out: any = cleana(input)
			expect(out).toEqual({ k1: 1, k2: 2, k3: 3, k4: 4, k5: 5 })
			expect(out).not.toBe(input)
		})

		it("flushes stash when first change is array cleanup", () => {
			const input = {
				k1: 1,
				k2: 2,
				k3: 3,
				k4: 4,
				k5: [1, null, 2],
			}
			const out: any = cleana(input)
			expect(out).toEqual({ k1: 1, k2: 2, k3: 3, k4: 4, k5: [1, 2] })
			expect(out).not.toBe(input)
		})

		it("flushes stash when only removals (removeKeys) and out allocated at end", () => {
			const input = {
				k1: 1,
				k2: 2,
				k3: 3,
				k4: 4,
				drop: 123,
			}
			const out = cleana(input, { removeKeys: ["drop"] })
			expect(out).toEqual({ k1: 1, k2: 2, k3: 3, k4: 4 })
			expect(out).not.toBe(input)
		})
	})

	// ─── Circular references ─────────────────────────────────────────────────────
	describe("circularReference", () => {
		it("disabled by default: does not affect normal data", () => {
			const input = { a: 1, b: { c: 2 } }
			expect(cleana(input)).toEqual({ a: 1, b: { c: 2 } })
		})

		it("removes self-referencing object when enabled", () => {
			const input: any = { a: 1 }
			input.self = input
			const out = cleana(input, { circularReference: true })
			expect(out).toEqual({ a: 1 })
			expect("self" in (out as any)).toBe(false)
		})

		it("removes circular reference in nested object", () => {
			const input: any = { a: 1, nested: { b: 2 } }
			input.nested.parent = input
			const out = cleana(input, { circularReference: true })
			expect(out).toEqual({ a: 1, nested: { b: 2 } })
		})

		it("removes circular reference in array", () => {
			const input: any = { a: 1, items: [] }
			input.items.push(input)
			input.items.push(2)
			const out = cleana(input, { circularReference: true })
			expect(out).toEqual({ a: 1, items: [2] })
		})

		it("removes deeply nested circular reference", () => {
			const input: any = { a: { b: { c: { d: 1 } } } }
			input.a.b.c.loop = input.a
			const out = cleana(input, { circularReference: true })
			expect(out).toEqual({ a: { b: { c: { d: 1 } } } })
		})

		it("handles multiple circular references", () => {
			const input: any = { a: 1, b: 2 }
			input.refA = input
			input.refB = input
			const out = cleana(input, { circularReference: true })
			expect(out).toEqual({ a: 1, b: 2 })
		})

		it("handles array containing multiple refs to same object", () => {
			const shared: any = { x: 1 }
			const input = { arr: [shared, shared, shared] }
			// First occurrence is kept, subsequent refs to same object are removed
			const out = cleana(input, { circularReference: true })
			expect(out).toEqual({ arr: [{ x: 1 }] })
		})

		it("works with inPlace=true", () => {
			const input: any = { a: 1, nested: { b: 2 } }
			input.nested.parent = input
			const out = cleana(input, { circularReference: true, inPlace: true })
			expect(out).toBe(input)
			expect(input).toEqual({ a: 1, nested: { b: 2 } })
		})

		it("still cleans other values when circular reference enabled", () => {
			const input: any = { a: null, b: "", c: 1 }
			input.self = input
			const out = cleana(input, { circularReference: true })
			expect(out).toEqual({ c: 1 })
		})

		it("handles circular array self-reference", () => {
			const arr: any[] = [1, 2]
			arr.push(arr)
			const out = cleana(arr, { circularReference: true })
			expect(out).toEqual([1, 2])
		})

		it("handles complex graph with multiple circular paths", () => {
			const a: any = { name: "a" }
			const b: any = { name: "b" }
			const c: any = { name: "c" }
			a.next = b
			b.next = c
			c.next = a // circular back to start
			a.sibling = c
			const out = cleana(a, { circularReference: true })
			// First traversal: a -> b -> c, then c.next (a) is circular, a.sibling (c) is circular
			expect(out).toEqual({ name: "a", next: { name: "b", next: { name: "c" } } })
		})

		it("removes circular ref but keeps other props on same object", () => {
			const input: any = { a: 1, b: { x: 10, y: 20 } }
			input.b.circular = input.b
			const out = cleana(input, { circularReference: true })
			expect(out).toEqual({ a: 1, b: { x: 10, y: 20 } })
		})
	})
})
