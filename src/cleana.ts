import type { CleanaOptions, Cleaned } from "./types"
import { deepEqual, isPlainObject } from "./utils"

/**
 * Internal sentinel meaning: "drop this value from its parent".
 * Returned from walkers when an element/property should be removed.
 */
const SKIP = Symbol("cleana.skip")

/**
 * Cached tag check to identify "object-like records" we should traverse.
 * This intentionally includes plain objects and class instances, and excludes
 * Date/Map/Set/RegExp/etc (those are preserved as-is).
 */
const OBJ_TAG = "[object Object]"
const toString = Object.prototype.toString

/** Shared empty set to avoid per-call allocation when removeKeys is not used. */
const EMPTY_SET = new Set<string>()

/**
 * Options compiled into a single bitfield.
 * This avoids repeated boolean lookups inside hot loops.
 */
const F = {
	CleanArray: 1 << 0, // drop empty arrays
	CleanObject: 1 << 1, // drop empty objects
	CleanNull: 1 << 2, // drop null
	CleanString: 1 << 3, // drop ""
	CleanNaN: 1 << 4, // drop NaN
	CleanUndefined: 1 << 5, // drop undefined
	InPlace: 1 << 6, // mutate input arrays/objects instead of cloning
	HasRemoveKeys: 1 << 7, // removeKeys provided
	HasRemoveValues: 1 << 8, // removeValues provided
} as const

const DEFAULT_FLAGS
	= F.CleanArray | F.CleanObject | F.CleanNull | F.CleanString | F.CleanNaN | F.CleanUndefined

/** Precomputed config for cleana() with no options; avoids per-call allocation. */
const DEFAULT_NORMALIZED: Normalized = {
	flags: DEFAULT_FLAGS,
	removeKeysSet: EMPTY_SET,
	removeValues: [],
}

/**
 * Normalize user options into a compact runtime config.
 * This function is called once per `cleana()` invocation.
 */
function normalize(options?: CleanaOptions): Normalized {
	if (!options)
		return DEFAULT_NORMALIZED

	const removeKeys = options.removeKeys ?? []
	const removeValues = options.removeValues ?? []

	let flags = 0
	if (options.cleanArray ?? true)
		flags |= F.CleanArray
	if (options.cleanObject ?? true)
		flags |= F.CleanObject
	if (options.cleanNull ?? true)
		flags |= F.CleanNull
	if (options.cleanString ?? true)
		flags |= F.CleanString
	if (options.cleanNaN ?? true)
		flags |= F.CleanNaN
	if (options.cleanUndefined ?? true)
		flags |= F.CleanUndefined
	if (options.inPlace ?? false)
		flags |= F.InPlace
	if (removeKeys.length)
		flags |= F.HasRemoveKeys
	if (removeValues.length)
		flags |= F.HasRemoveValues

	return {
		flags,
		// Used only when HasRemoveKeys is enabled; otherwise it’s inert.
		removeKeysSet: removeKeys.length > 0 ? new Set(removeKeys) : EMPTY_SET,
		removeValues,
	}
}

/**
 * Public API:
 * - Traverses arrays and object-like records.
 * - Removes values based on options.
 * - Preserves non-record objects (Date/Map/Set/RegExp/etc) as-is.
 *
 * Non-inPlace mode uses structural sharing:
 * unchanged subtrees reuse the original references.
 */
export function cleana<T>(data: T, options?: CleanaOptions): Cleaned<T> {
	const cfg = normalize(options)

	// Only bail on null/undefined; do not treat 0/false/"" as empty at the root.
	if (data == null)
		return data as Cleaned<T>

	// Root dispatch based on runtime type.
	if (Array.isArray(data))
		return cleanArray(data as any[], cfg) as Cleaned<T>

	if (isCleanableObject(data)) {
		// Root object cannot “disappear”; if it becomes empty and CleanObject=true,
		// return {} instead of propagating SKIP.
		const v = cleanObject(data as any, cfg)
		return (v === SKIP ? ({} as any) : v) as Cleaned<T>
	}

	// Primitives and non-cleanable objects are returned unchanged.
	return data as Cleaned<T>
}

/**
 * Clean a single value:
 * - returns the cleaned value, or
 * - returns SKIP to indicate it should be removed from its parent.
 */
function cleanAny(value: any, cfg: Normalized): any | typeof SKIP {
	const flags = cfg.flags
	const hasRemoveValues = (flags & F.HasRemoveValues) !== 0

	// Fast path: primitives first (avoids object checks and recursion).
	if (value == null || typeof value !== "object") {
		// Optional user-defined removals (strict + deep match).
		if (hasRemoveValues && shouldRemoveValue(cfg.removeValues, value))
			return SKIP
		return shouldRemovePrimitive(value, flags) ? SKIP : value
	}

	// Optional user-defined removals for objects too.
	if (hasRemoveValues && shouldRemoveValue(cfg.removeValues, value))
		return SKIP

	// Arrays recurse via the array walker.
	if (Array.isArray(value)) {
		const cleaned = cleanArray(value, cfg)
		// If CleanArray=true, nested empty arrays are dropped.
		return (flags & F.CleanArray) === 0 || cleaned.length > 0 ? cleaned : SKIP
	}

	// Recurse into record-like objects; preserve everything else intact.
	return toString.call(value) === OBJ_TAG ? cleanObject(value, cfg) : value
}

/**
 * Clean an array.
 *
 * Non-inPlace mode uses structural sharing:
 * - If nothing changes, return the original array reference.
 * - Allocate an output array only after the first change (lazy copy).
 *
 * InPlace mode compacts the array in a single pass without splice.
 */
function cleanArray(arr: any[], cfg: Normalized): any[] {
	const flags = cfg.flags

	if ((flags & F.InPlace) === 0) {
		let out: any[] | null = null

		for (let i = 0; i < arr.length; i++) {
			const orig = arr[i]
			const v = cleanAny(orig, cfg)

			// Element removed: allocate output only on the first removal and copy the prefix.
			if (v === SKIP) {
				if (out === null) {
					out = []
					for (let j = 0; j < i; j++) out.push(arr[j])
				}
				continue
			}

			// Element kept: if we already allocated output, push into it.
			if (out !== null) {
				out.push(v)
			}
			// First replacement: allocate output, copy prefix, then push the changed value.
			else if (v !== orig) {
				out = []
				for (let j = 0; j < i; j++) out.push(arr[j])
				out.push(v)
			}
		}

		return out === null ? arr : out
	}

	// In-place compaction: write pointer trails read pointer.
	let w = 0
	for (let r = 0; r < arr.length; r++) {
		const v = cleanAny(arr[r], cfg)
		if (v !== SKIP)
			arr[w++] = v
	}
	arr.length = w
	return arr
}

/**
 * Clean an object-like record.
 *
 * Non-inPlace mode:
 * - Plain objects are structurally shared (return original reference if unchanged).
 * - Class instances always produce a new plain object (POJO) even if unchanged.
 *
 * The fixed-size “stash” avoids allocations for tiny plain objects:
 * - While we still believe the object is unchanged, we store up to 4 key/value pairs in locals.
 * - If we detect a change, we allocate `out` and flush the stashed pairs into it.
 */
function cleanObject(obj: Record<string, any>, cfg: Normalized): any | typeof SKIP {
	const flags = cfg.flags
	const hasRemoveKeys = (flags & F.HasRemoveKeys) !== 0
	const dropEmpty = (flags & F.CleanObject) !== 0
	const rks = cfg.removeKeysSet

	const isPlain = isPlainObject(obj)

	if ((flags & F.InPlace) === 0) {
		// Plain objects start as `out=null` to allow returning the original reference.
		// Instances start as `{}` because the output must be a POJO.
		let out: Record<string, any> | null = isPlain ? null : {}
		let changed = !isPlain
		let kept = false

		// Stash up to 4 unchanged keys without allocating arrays/objects.
		let k1: string | null = null; let v1: any
		let k2: string | null = null; let v2: any
		let k3: string | null = null; let v3: any
		let k4: string | null = null; let v4: any
		let stashCount = 0

		for (const k in obj) {
			// Optional key filtering.
			if (hasRemoveKeys && rks.has(k)) {
				changed = true
				continue
			}

			const orig = obj[k]
			const v = cleanAny(orig, cfg)

			// Value removed.
			if (v === SKIP) {
				changed = true
				continue
			}

			kept = true

			// If output already exists, write directly.
			if (out !== null) {
				out[k] = v
				if (v !== orig)
					changed = true
				continue
			}

			// First detected change: allocate output and flush stashed pairs.
			if (v !== orig) {
				changed = true
				out = {}

				if (stashCount >= 1)
					out[k1!] = v1
				if (stashCount >= 2)
					out[k2!] = v2
				if (stashCount >= 3)
					out[k3!] = v3
				if (stashCount >= 4)
					out[k4!] = v4

				out[k] = v
				continue
			}

			// Still unchanged: stash this pair for potential later materialization.
			if (stashCount === 0) {
				k1 = k; v1 = orig; stashCount = 1
			}
			else if (stashCount === 1) {
				k2 = k; v2 = orig; stashCount = 2
			}
			else if (stashCount === 2) {
				k3 = k; v3 = orig; stashCount = 3
			}
			else if (stashCount === 3) {
				k4 = k; v4 = orig; stashCount = 4
			}
			else {
				// Many unchanged keys: materialize output and continue normally.
				changed = true
				out = {}
				out[k1!] = v1
				out[k2!] = v2
				out[k3!] = v3
				out[k4!] = v4
				out[k] = orig
			}
		}

		// Drop empty objects if enabled.
		if (dropEmpty && !kept)
			return SKIP

		// Plain object with no changes: reuse original reference.
		if (!changed && out === null)
			return obj

		// Changes happened but we never materialized output (e.g. only removals):
		// build the output from the stashed unchanged pairs.
		if (out === null) {
			out = {}
			if (stashCount >= 1)
				out[k1!] = v1
			if (stashCount >= 2)
				out[k2!] = v2
			if (stashCount >= 3)
				out[k3!] = v3
			if (stashCount >= 4)
				out[k4!] = v4
		}

		return out
	}

	// In-place mutation: delete/overwrite properties directly.
	let kept = false
	for (const k in obj) {
		if (hasRemoveKeys && rks.has(k)) {
			delete obj[k]
			continue
		}

		const v = cleanAny(obj[k], cfg)
		if (v === SKIP) {
			delete obj[k]
		}
		else {
			obj[k] = v
			kept = true
		}
	}

	return dropEmpty && !kept ? SKIP : obj
}

/**
 * User-supplied removeValues matching:
 * - First pass is strict equality (fast).
 * - Second pass is deep equality (compat, potentially expensive).
 */
function shouldRemoveValue(removeValues: readonly any[], value: any): boolean {
	for (let i = 0; i < removeValues.length; i++) {
		if (value === removeValues[i])
			return true
	}
	for (let i = 0; i < removeValues.length; i++) {
		if (deepEqual(value, removeValues[i]))
			return true
	}
	return false
}

/**
 * Built-in primitive removals controlled by flags.
 * `v !== v` is a branchless NaN check (only NaN is not equal to itself).
 */
function shouldRemovePrimitive(v: any, flags: number): boolean {
	if (v === undefined)
		return (flags & F.CleanUndefined) !== 0
	if (v === null)
		return (flags & F.CleanNull) !== 0
	if (v === "")
		return (flags & F.CleanString) !== 0
	// eslint-disable-next-line no-self-compare
	if (v !== v)
		return (flags & F.CleanNaN) !== 0
	return false
}

/**
 * Decide whether a value should be traversed as a record.
 * This includes:
 * - plain objects
 * - class instances (still `[object Object]`)
 *
 * This excludes and preserves as-is:
 * - Date
 * - Map/Set/RegExp
 * - Error, typed arrays, buffers, etc.
 */
function isCleanableObject(v: any): v is Record<string, any> {
	if (v === null || typeof v !== "object")
		return false
	return toString.call(v) === OBJ_TAG
}

type Normalized = {
	flags: number
	removeKeysSet: Set<string>
	removeValues: readonly any[]
}
