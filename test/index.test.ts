import type { CleanaOptions } from "../src"
import { describe, expect, it } from "vitest"
import { cleana } from "../src"

describe("cleana", () => {
	describe("basics", () => {
		it("removes null, NaN, empty strings, undefined, empty arrays and objects by default", () => {
			const input = { a: null, b: Number.NaN, c: "", d: undefined, e: [], f: {}, g: 42 }
			expect(cleana(input)).toEqual({ g: 42 })
		})

		it("does not treat 0/false as empty", () => {
			const input = { a: 0, b: false, c: "", d: null, e: Number.NaN }
			expect(cleana(input)).toEqual({ a: 0, b: false })
		})

		it("root primitive is returned as-is", () => {
			expect(cleana(1)).toBe(1)
			expect(cleana(false)).toBe(false)
			expect(cleana("str")).toBe("str")
			expect(cleana("")).toBe("")
			expect(cleana(null)).toBe(null)
			expect(cleana(undefined)).toBe(undefined)
		})

		it("root empty object becomes {}", () => {
			expect(cleana({})).toEqual({})
		})

		it("root array is returned (it may become empty, but it is still a valid root)", () => {
			expect(cleana([])).toEqual([])
			expect(cleana([null, "", Number.NaN])).toEqual([])
		})

		it("root object never disappears (returns {} instead of SKIP)", () => {
			expect(cleana({ a: null })).toEqual({})
		})
	})

	describe("options", () => {
		it("respects cleanNull=false", () => {
			const ops: CleanaOptions = { cleanNull: false }
			expect(cleana({ a: null, b: "", c: 1 }, ops)).toEqual({ a: null, c: 1 })
		})

		it("respects cleanUndefined=false for objects and arrays", () => {
			const ops: CleanaOptions = { cleanUndefined: false }
			expect(cleana({ a: undefined, b: [undefined, null, 1] }, ops)).toEqual({ a: undefined, b: [undefined, 1] })
		})

		it("respects cleanNaN=false", () => {
			const ops: CleanaOptions = { cleanNaN: false }
			const out = cleana({ a: Number.NaN, b: 1 }, ops) as any
			expect(Number.isNaN(out.a)).toBe(true)
			expect(out.b).toBe(1)
		})

		it("respects cleanString=false", () => {
			const ops: CleanaOptions = { cleanString: false }
			expect(cleana({ a: "", b: null, c: 1 }, ops)).toEqual({ a: "", c: 1 })
		})

		it("respects cleanArray=false (keeps empty arrays, but still cleans their contents)", () => {
			const ops: CleanaOptions = { cleanArray: false }
			expect(cleana({ a: [], b: [null], c: 1 }, ops)).toEqual({ a: [], b: [], c: 1 })
		})

		it("respects cleanObject=false (keeps empty objects, but still cleans their contents)", () => {
			const ops: CleanaOptions = { cleanObject: false }
			expect(cleana({ a: {}, b: { c: null }, d: 1 }, ops)).toEqual({ a: {}, b: {}, d: 1 })
		})

		it("respects inPlace=true (mutates original references)", () => {
			const input: any = { a: null, b: [1, null, 2], c: { d: "", e: 1 } }
			const out = cleana(input, { inPlace: true })
			expect(out).toBe(input)
			expect(input).toEqual({ b: [1, 2], c: { e: 1 } })
		})
	})

	describe("nested structures", () => {
		it("cleans nested structures with various types (non-inPlace)", () => {
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

		it("cleans nested structures with various types (inPlace)", () => {
			const input: any = {
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
			expect(cleana(input, { inPlace: true })).toEqual(expected)
			expect(input).toEqual(expected)
		})

		it("handles deeply nested structures with mixed values", () => {
			const input = {
				a: { b: { c: { d: null } } },
				e: [],
				f: { g: [Number.NaN, "", {}, null] },
				h: { i: "valid", j: {} },
			}
			const expected = { h: { i: "valid" } }
			expect(cleana(input)).toEqual(expected)
		})

		it("handles deeply nested structures with mixed values (inPlace)", () => {
			const input: any = {
				a: { b: { c: { d: null } } },
				e: [],
				f: { g: [Number.NaN, "", {}, null] },
				h: { i: "valid", j: {} },
			}
			const expected = { h: { i: "valid" } }
			expect(cleana(input, { inPlace: true })).toEqual(expected)
			expect(input).toEqual(expected)
		})

		it("handles deeply nested root arrays with mixed values (inPlace)", () => {
			const input: any = [Number.NaN, "", { a: 1, b: [{}, [], { g: [{ a: 123, c: [] }] }] }, null]
			const expected = [{ a: 1, b: [{ g: [{ a: 123 }] }] }]
			expect(cleana(input, { inPlace: true })).toEqual(expected)
			expect(input).toEqual(expected)
		})

		it("returns an empty object when only empty values are present", () => {
			const input = { a: null, b: "", c: Number.NaN, d: [] }
			expect(cleana(input)).toEqual({})
		})
	})

	describe("removeKeys", () => {
		it("removes keys at all nesting levels", () => {
			const input = { a: 1, secret: "x", nested: { secret: "y", keep: 1 }, arr: [{ secret: "z", ok: 1 }] }
			const expected = { a: 1, nested: { keep: 1 }, arr: [{ ok: 1 }] }
			expect(cleana(input, { removeKeys: ["secret"] })).toEqual(expected)
		})

		it("removes keys inPlace and mutates the original object", () => {
			const input: any = { a: 1, secret: "x", nested: { secret: "y", keep: 1 } }
			const out = cleana(input, { removeKeys: ["secret"], inPlace: true })
			expect(out).toBe(input)
			expect(input).toEqual({ a: 1, nested: { keep: 1 } })
		})

		it("removing last keys drops nested object", () => {
			const input = { a: { secret: 1 } }
			expect(cleana(input, { removeKeys: ["secret"] })).toEqual({})
		})
	})

	describe("removeValues", () => {
		it("removes primitives by strict equality", () => {
			const input = { a: 1, b: 2, c: "x", d: false, e: null, f: "55" }
			const expected = { b: 2 }
			expect(cleana(input, { removeValues: [1, "x", false, null, "55"] })).toEqual(expected)
		})

		it("removes objects via deepEqual (compat path)", () => {
			const input = { a: { k: 1 }, b: { k: 2 }, c: [{ x: 1 }, { x: 2 }] }
			const expected = { b: { k: 2 }, c: [{ x: 2 }] }
			expect(cleana(input, { removeValues: [{ k: 1 }, { x: 1 }] })).toEqual(expected)
		})

		it("removes values inPlace and mutates arrays and objects", () => {
			const input: any = { a: [1, "55", true], b: { c: 1, d: 2, e: "55" } }
			const out = cleana(input, { inPlace: true, removeValues: [1, "55"] })
			expect(out).toBe(input)
			expect(input).toEqual({ a: [true], b: { d: 2 } })
		})

		it("removing last items drops nested array when cleanArray=true", () => {
			const input = { a: [1] }
			expect(cleana(input, { removeValues: [1] })).toEqual({})
		})

		it("removeValues is applied before primitive cleaning", () => {
			const input = { a: "", b: 1 }
			expect(cleana(input, { cleanString: false, removeValues: [""] })).toEqual({ b: 1 })
		})
	})

	describe("structural sharing (non-inPlace)", () => {
		it("returns the same reference when nothing changes (plain objects)", () => {
			const input = { a: 1, b: { c: 2 }, d: [3, 4] }
			const out: any = cleana(input)
			expect(out).toBe(input)
			expect(out.b).toBe(input.b)
			expect(out.d).toBe(input.d)
		})

		it("returns a new object only for changed branches", () => {
			const input = { a: 1, b: { c: null, d: 2 }, e: { f: 3 } }
			const out: any = cleana(input)

			expect(out).not.toBe(input)
			expect(out.b).not.toBe(input.b)
			expect(out.b).toEqual({ d: 2 })
			expect(out.e).toBe(input.e)
		})

		it("returns a new array only if something inside changes", () => {
			const input = { a: [1, 2, 3], b: [1, null, 2] }
			const out: any = cleana(input)

			expect(out.a).toBe(input.a)
			expect(out.b).not.toBe(input.b)
			expect(out.b).toEqual([1, 2])
		})

		it("does not share class instances (always materializes to POJO)", () => {
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

	describe("special values & non-record objects", () => {
		it("keeps Date instances intact", () => {
			const date = new Date()
			expect(cleana(date)).toBe(date)
			expect(cleana({ date })).toEqual({ date })
		})

		it("keeps non-record objects intact (Map/Set/RegExp)", () => {
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

		it("preserves Error objects (not traversed)", () => {
			const err = new Error("x")
			const input: any = { err, bad: null }
			const out: any = cleana(input)
			expect(out.err).toBe(err)
			expect("bad" in out).toBe(false)
		})

		it("handles BigInt values", () => {
			const input = { a: 1n, b: null }
			expect(cleana(input)).toEqual({ a: 1n })
		})

		it("does not attempt to traverse functions / symbols", () => {
			const fn = () => 1
			const sym = Symbol("x")
			const input: any = { fn, sym, bad: null }
			const out: any = cleana(input)
			expect(out.fn).toBe(fn)
			expect(out.sym).toBe(sym)
			expect("bad" in out).toBe(false)
		})

		it("handles special numbers: -0, Infinity, -Infinity", () => {
			const input = { a: -0, b: Infinity, c: -Infinity, d: Number.NaN, e: null }
			const out: any = cleana(input)
			expect(Object.is(out.a, -0)).toBe(true)
			expect(out.b).toBe(Infinity)
			expect(out.c).toBe(-Infinity)
			expect("d" in out).toBe(false)
			expect("e" in out).toBe(false)
		})
	})

	describe("sparse arrays (holes)", () => {
		it("handles sparse arrays in non-inPlace mode", () => {
			const arr = Array.from({ length: 5 })
			arr[1] = null
			arr[3] = 1
			const out = cleana(arr as any)
			expect(out).toEqual([1])
		})

		it("handles sparse arrays in inPlace mode", () => {
			const arr: any = Array.from({ length: 5 })
			arr[1] = null
			arr[3] = 1
			const out = cleana(arr, { inPlace: true })
			expect(out).toBe(arr)
			expect(arr).toEqual([1])
		})
	})

	describe("empty behavior (nested)", () => {
		it("drops nested empty arrays/objects when enabled", () => {
			const input = { a: { b: { c: [] } }, d: { e: {} }, keep: { x: 1 } }
			expect(cleana(input)).toEqual({ keep: { x: 1 } })
		})

		it("keeps nested empty arrays/objects when cleanArray/cleanObject are disabled", () => {
			const input = { a: { b: { c: [] } }, d: { e: {} } }
			const out = cleana(input, { cleanArray: false, cleanObject: false })
			expect(out).toEqual({ a: { b: { c: [] } }, d: { e: {} } })
		})
	})

	describe("class instances", () => {
		it("cleans class instances into a POJO (non-inPlace)", () => {
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

		it("inPlace on class instances mutates the instance itself", () => {
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

	describe("object.create(null)", () => {
		it("supports null-prototype objects (non-inPlace)", () => {
			const obj = Object.create(null) as any
			obj.a = null
			obj.b = 1
			expect(cleana(obj)).toEqual({ b: 1 })
		})

		it("supports null-prototype objects (inPlace)", () => {
			const obj = Object.create(null) as any
			obj.a = null
			obj.b = 1
			const out = cleana(obj, { inPlace: true })
			expect(out).toBe(obj)
			expect(obj).toEqual({ b: 1 })
		})
	})

	describe("sanity", () => {
		it("does not crash on empty options or unknown shapes", () => {
			expect(cleana({ a: 1 }, {} as any)).toEqual({ a: 1 })
		})

		it("handles very deep nesting without changing semantics", () => {
			const input = { a: { b: { c: { d: { e: null, f: 1 } } } } }
			expect(cleana(input)).toEqual({ a: { b: { c: { d: { f: 1 } } } } })
		})
	})

	describe("coverage: cleanObject stash paths", () => {
		it("materializes output via stash overflow (>4 unchanged keys) before the first change", () => {
			// First 5 keys unchanged => stash overflow path triggers allocation.
			// Later key becomes removable => real change happens.
			const input = {
				k1: 1,
				k2: 2,
				k3: 3,
				k4: 4,
				k5: 5,
				drop: null, // change occurs here
			}

			const out: any = cleana(input)

			expect(out).toEqual({ k1: 1, k2: 2, k3: 3, k4: 4, k5: 5 })
			expect(out).not.toBe(input) // root changed because `drop` removed
		})
	})

	describe("coverage: stash flush on first change", () => {
		it("flushes k1..k4 when the first change happens after stashing 4 unchanged keys", () => {
			const input = {
				k1: 1,
				k2: 2,
				k3: 3,
				k4: 4,
				// first actual change: array gets cleaned to a new array => v !== orig
				k5: [1, null, 2],
			}

			const out: any = cleana(input)

			expect(out).toEqual({
				k1: 1,
				k2: 2,
				k3: 3,
				k4: 4,
				k5: [1, 2],
			})
			expect(out).not.toBe(input)
		})
	})

	describe("coverage: stash flush on late materialize", () => {
		it("flushes k1..k4 when only removals happened and out is allocated at the end", () => {
			const input = {
				k1: 1,
				k2: 2,
				k3: 3,
				k4: 4,
				drop: 123, // removed via removeKeys => changed=true, but no v !== orig replacements
			}

			const out = cleana(input, { removeKeys: ["drop"] })

			expect(out).toEqual({ k1: 1, k2: 2, k3: 3, k4: 4 })
			expect(out).not.toBe(input)
		})
	})
})
