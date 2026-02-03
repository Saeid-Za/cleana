// Code taken from `fast-deep-equal`
// https://www.npmjs.com/package/fast-deep-equal
export function deepEqual(itemA: any, itemB: any): boolean {
	if (itemA === itemB)
		return true

	if (itemA && itemB && typeof itemA === "object" && typeof itemB === "object") {
		if (itemA.constructor !== itemB.constructor)
			return false

		let length: number
		let i: number

		if (Array.isArray(itemA)) {
			length = itemA.length
			if (length !== itemB.length)
				return false
			for (i = length; i-- !== 0;) {
				if (!deepEqual(itemA[i], itemB[i]))
					return false
			}
			return true
		}

		if (itemA instanceof Map && itemB instanceof Map) {
			if (itemA.size !== itemB.size)
				return false
			for (const [key] of itemA.entries()) {
				if (!itemB.has(key))
					return false
			}
			for (const [key, value] of itemA.entries()) {
				if (!deepEqual(value, itemB.get(key)))
					return false
			}
			return true
		}

		if (itemA instanceof Set && itemB instanceof Set) {
			if (itemA.size !== itemB.size)
				return false
			for (const key of itemA.keys()) {
				if (!itemB.has(key))
					return false
			}
			return true
		}

		if (itemA instanceof Date && itemB instanceof Date) {
			return itemA.getTime() === itemB.getTime()
		}

		if (itemA.constructor === RegExp) {
			return itemA.source === itemB.source && itemA.flags === itemB.flags
		}

		if (itemA.valueOf !== Object.prototype.valueOf) {
			return itemA.valueOf() === itemB.valueOf()
		}

		if (itemA.toString !== Object.prototype.toString) {
			return itemA.toString() === itemB.toString()
		}

		const keys = Object.keys(itemA)
		length = keys.length

		if (length !== Object.keys(itemB).length)
			return false

		for (i = length; i-- !== 0;) {
			if (!Object.prototype.hasOwnProperty.call(itemB, keys[i]!))
				return false
		}

		for (i = length; i-- !== 0;) {
			const key = keys[i]!
			if (!deepEqual(itemA[key], itemB[key]))
				return false
		}

		return true
	}

	// true if both NaN, false otherwise
	// eslint-disable-next-line no-self-compare
	return itemA !== itemA && itemB !== itemB
}

/**
 * Detect “plain” objects for structural sharing decisions.
 * Plain objects may reuse the original reference when unchanged.
 * Class instances must be materialized into a new POJO even if unchanged.
 *
 * Accepts:
 * - `{}` / `new Object()`
 * - `Object.create(null)` (null-prototype dictionaries)
 */
export function isPlainObject(o: any): o is Record<string, any> {
	if (o === null || typeof o !== "object")
		return false
	const p = Object.getPrototypeOf(o)
	return p === Object.prototype || p === null
}
