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
}

export type Cleaned<T> = T extends Array<infer U> ? Partial<U>[] : Partial<T>
