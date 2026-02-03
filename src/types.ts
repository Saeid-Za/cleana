export type CleanaOptions = {
	/**
	 * create a new object that is cleaned or mutate the object passed to it & clean in place
	 * @default false
	 */
	inPlace?: boolean

	/**
	 * Forcefully remove keys, ie: ["key1", "key2"]
	 * @default []
	 */
	removeKeys?: string[]

	/**
	 * Forcefully remove values, ie: ["someString", 123, false, {key: "123"}]
	 *
	 * It uses the `fast-deep-equal` operator to check equality.
	 * @default []
	 */
	removeValues?: any[]

	/**
	 * Remove empty arrays, ie: []
	 * @default true
	 */
	cleanArray?: boolean

	/**
	 * Remove empty objects, ie: {}
	 * @default true
	 */
	cleanObject?: boolean

	/**
	 * Remove null values
	 * @default true
	 */
	cleanNull?: boolean

	/**
	 * Remove undefined values
	 * @default true
	 */
	cleanUndefined?: boolean

	/**
	 * Remove empty strings, ie: ""
	 * @default true
	 */
	cleanString?: boolean

	/**
	 * Remove NaN values
	 * @default true
	 */
	cleanNaN?: boolean

	/**
	 * Handle circular references by removing them.
	 * When enabled, circular references are detected and removed (treated as SKIP).
	 * This adds a small overhead due to WeakSet tracking, so it's disabled by default.
	 * @default false
	 */
	circularReference?: boolean
}

export type Cleaned<T> = T extends Array<infer U> ? Partial<U>[] : Partial<T>
