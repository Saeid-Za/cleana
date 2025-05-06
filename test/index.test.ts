import { describe, expect, it } from "vitest"
import { cleana, type CleanaOptions } from "../src"

describe("cleaner", () => {
	it("removes null, NaN, and empty strings from a simple object", () => {
		const input = { a: null, b: Number.NaN, c: "", d: 42 }
		const expected = { d: 42 }
		expect(cleana(input)).toEqual(expected)
	})

	it("removes empty arrays and objects", () => {
		const input = { a: {}, b: [], c: { d: [], e: {} }, f: 100 }
		const expected = { f: 100 }
		expect(cleana(input)).toEqual(expected)
	})

	it("shouldn't remove null from simple object", () => {
		const ops: CleanaOptions = { cleanNull: false }
		const input = { a: null, b: Number.NaN, c: "", d: 42 }
		const expected = { d: 42, a: null }
		expect(cleana(input, ops)).toEqual(expected)
	})

	it("shouldn't remove undefined from simple array", () => {
		const ops: CleanaOptions = { cleanUndefined: false }
		const input = { a: [undefined, null, 1, 2, 3] }
		const expected = { a: [undefined, 1, 2, 3] }
		expect(cleana(input, ops)).toEqual(expected)
	})

	it("shouldn't remove undefined from simple object", () => {
		const ops: CleanaOptions = { cleanUndefined: false }
		const input = { a: undefined, b: [undefined, null, 1, 2, 3] }
		const expected = { a: undefined, b: [undefined, 1, 2, 3] }
		expect(cleana(input, ops)).toEqual(expected)
	})

	it("shouldn't remove NaN from simple object", () => {
		const ops: CleanaOptions = { cleanNaN: false }
		const input = { a: null, b: Number.NaN, c: "", d: 42 }
		const expected = { d: 42, b: Number.NaN }
		expect(cleana(input, ops)).toEqual(expected)
	})

	it("shouldn't remove empty objects from simple object", () => {
		const ops: CleanaOptions = { cleanObject: false }
		const input = { a: null, b: Number.NaN, c: "", d: 42, e: {} }
		const expected = { d: 42, e: {} }
		expect(cleana(input, ops)).toEqual(expected)
	})

	it("shouldn't remove empty arrays from simple object", () => {
		const ops: CleanaOptions = { cleanArray: false }
		const input = { a: null, b: Number.NaN, c: "", d: 42, e: [] }
		const expected = { d: 42, e: [] }
		expect(cleana(input, ops)).toEqual(expected)
	})

	it("shouldn't remove empty strings from simple object", () => {
		const ops: CleanaOptions = { cleanString: false }
		const input = { a: null, b: Number.NaN, c: "", d: 42, e: [] }
		const expected = { d: 42, c: "" }
		expect(cleana(input, ops)).toEqual(expected)
	})

	it("cleans nested structures with various types", () => {
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

	it("cleans nested structures with various types inplace", () => {
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
		expect(cleana(input, { inPlace: true })).toEqual(expected)
		expect(input).toEqual(expected)
	})

	it("handles deeply nested structures arrays with mixed values", () => {
		const input = [Number.NaN, "", { a: 1, b: [{}, [], { g: [{ a: 123, c: [] }] }] }, null]
		const expected = [{ a: 1, b: [{ g: [{ a: 123 }] }] }]
		expect(cleana(input, { inPlace: true })).toEqual(expected)
	})

	it("handles deeply nested structures with mixed values", () => {
		const input = {
			a: { b: { c: { d: null } } },
			e: [],
			f: { g: [Number.NaN, "", {}, null] },
			h: { i: "valid", j: {} },
		}
		const expected = {
			h: { i: "valid" },
		}
		expect(cleana(input)).toEqual(expected)
	})

	it("handles deeply nested structures with mixed values inplace", () => {
		const input = {
			a: { b: { c: { d: null } } },
			e: [],
			f: { g: [Number.NaN, "", {}, null] },
			h: { i: "valid", j: {} },
		}
		const expected = {
			h: { i: "valid" },
		}
		expect(cleana(input, { inPlace: true })).toEqual(expected)
		expect(input).toEqual(expected)
	})

	it("returns an empty object when only empty values are present", () => {
		const input = { a: null, b: "", c: Number.NaN, d: [] }
		const expected = {}
		expect(cleana(input)).toEqual(expected)
	})

	it("cleans complex structures with valid values inplace", () => {
		const input = {
			x1: null,
			x2: {},
			x3: { y1: "text", y2: [[], [], [[[]]]], y3: [{ z1: Number.NaN }] },
			x4: [1, 2, "", null],
			x5: [{ a: {}, b: Number.NaN }, { c: "valid" }],
		}
		const expected = {
			x3: { y1: "text", y2: [[], [], [[[]]]], y3: [] },
			x4: [1, 2],
			x5: [{ c: "valid" }],
		}
		expect(cleana(input, { inPlace: true, cleanArray: false })).toEqual(expected)
		expect(input).toEqual(expected)
	})

	it("cleans complex structures with valid values", () => {
		const input = {
			x1: null,
			x2: {},
			x3: { y1: "text", y2: [[], [], [[[]]]], y3: [{ z1: Number.NaN }] },
			x4: [1, 2, "", null],
			x5: [{ a: {}, b: Number.NaN }, { c: "valid" }],
		}
		const expected = {
			x3: { y1: "text", y2: [[], [], [[[]]]], y3: [] },
			x4: [1, 2],
			x5: [{ c: "valid" }],
		}
		expect(cleana(input, { cleanArray: false })).toEqual(expected)
	})

	it("should remove specefic keys", () => {
		const input = { a: { b: { c: 1, d: 2, e: 3 }, e: 5 } }
		const expected = { a: { b: { d: 2 } } }
		expect(cleana(input, { removeKeys: ["e", "c"] })).toEqual(expected)
	})

	it("should remove specefic keys - in place", () => {
		const input = { a: { b: { c: 1, d: 2, e: 3 }, e: 5 } }
		const expected = { a: { b: { d: 2 } } }
		expect(cleana(input, { removeKeys: ["e", "c"], inPlace: true })).toEqual(expected)
		expect(input).toEqual(expected)
	})

	it("should remove specefic values", () => {
		const input = { a: { b: { c: 1, d: 2, e: 3, u: "55", g: false }, e: 5 }, v: { g: 100 } }
		const expected = { a: { b: { d: 2 }, e: 5 } }
		expect(cleana(input, { removeValues: [1, 3, false, "55", { g: 100 }] })).toEqual(expected)
	})

	it("should remove specefic values - in place", () => {
		const input = { a: { b: { c: 1, d: 2, e: 3, u: "55", g: false }, e: 5, z: [1, "55", true] } }
		const expected = { a: { b: { d: 2 }, e: 5, z: [true] } }
		expect(cleana(input, { inPlace: true, removeValues: [1, 3, false, "55"] })).toEqual(expected)
		expect(input).toEqual(expected)
	})

	it("should cover non array/objects", () => {
		expect(cleana(1)).toEqual(1)
		expect(cleana(false)).toEqual(false)
		expect(cleana("str")).toEqual("str")
		expect(cleana("")).toEqual("")
		expect(cleana(null)).toEqual(null)
	})

	it("shouldn't clean date values", () => {
		const date = new Date()
		expect(cleana(date)).toEqual(date)
		expect(cleana({ date })).toEqual({ date })
	})

	it("should be able to clean class instances", () => {
		class Sample {
			str: string | null
			date: Date
			obj: Record<string, any>
			arr: Array<any>
		}

		const sample = new Sample()
		sample.str = null
		sample.date = new Date()
		sample.arr = [1, "55", undefined, false, null]

		expect(cleana(sample)).toEqual({ date: sample.date, arr: [1, "55", false] })
	})
})
