
/**
 * chunks any iterable, returns a generator
 * @param arr
 * @param size
 * @returns a generator of chunks
 * @example chunk([1, 2, 3], 2) -> [[1, 2], 3]
 */
export const chunk = function* <T>(arr: Iterable<T>, size = 1) {
  let chunk = [];
  for (const v of arr) {
    chunk.push(v);
    if (chunk.length === size) {
      yield chunk;
      chunk = [];
    }
  }
  if (chunk.length > 0) {
    yield chunk;
  }
};

/**
 * takes first x elements of an iterable
 * @param arr
 * @param size
 * @returns x elements from arr
 * @example take([1, 2, 3], 2) -> [1, 2]
 */
export const take = function <T>(arr: Iterable<T>, size = 1) {
  const chunks = chunk(arr, size);
  return chunks.next().value;
};

/**
 * Transforms a map into a standard JS object
 * @param map
 * @returns object
 * @example getObjectFromMap(new Map(['a', 1])) -> {a: 1}
 */
export const getObjectFromMap = (map: Map<string, any>) => {
  const newData = {} as {
    [id: string]: any;
  };
  for (const [key, value] of map) {
    newData[key] = value;
  }
  return newData;
};

/**
 * Sleeps the current execution by a delay time
 * @param delay in ms
 * @example await sleep(1000)
 */
export const sleep = (delay: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
};

/**
 * generate a unique number given a string
 * @param str, input string
 * @example hashString('example') -> 1591818012
 */
export const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash += Math.pow(str.charCodeAt(i) * 31, str.length - i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

/**
 * gets from an object even if it is undefined
 * @param record, the object
 * @param accessor, input string
 * @example get({a: 1}, 'a') -> 1
 */
const get = <T>(record?: Record<string, T>, accessor = '') =>
  record?.[accessor];

/**
 * gets from an object even if it is undefined
 * @param row, the object
 */
export const getRowNodeId = (row: { id: string }) => get(row, 'id') ?? '';

/**
 * checks the primative is an object and not null
 * @param obj, the object
 */
const isObject = <T>(obj: T) => typeof obj === 'object' && obj != null;

/**
 * checks if two objects are the same by value
 * @param obj1
 * @param obj2
 */
export const deepEquals = (obj1?: any, obj2?: any) => {
  if (obj1 === undefined || obj2 === undefined) {
    return false;
  }
  if (obj1 === obj2) {
    return true;
  }
  if ([obj1, obj2].every(isObject)) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return false;
    }
    for (const prop in obj1) {
      if (!deepEquals(obj1[prop], obj2[prop])) {
        return false;
      }
    }
    return true;
  }
  return false;
};

/**
 * gets you the aggregate id from the path params
 * @param pathParams
 */
export const parsePathParams = (pathParams: Record<string, string>) =>
  pathParams['aggregateId'] ?? '';

/**
 * replaces in the array based on a predicate
 * @param arr array returned
 * @param toReplace list of items to replace
 * @param predicate test to find the item
 * @param append if not found, add to the end
 */
export const replaceOrAdd = <T>(
  arr: T[],
  toReplace: T[],
  predicate: (i: T) => (i: T) => boolean,
  append = true
) => {
  const result = [] as T[];
  for (const item of arr) {
    const index = toReplace.findIndex(predicate(item));
    if (index === -1) {
      result.push(item);
    } else {
      result.push(toReplace[index]);
      toReplace.splice(index, 1);
    }
  }
  return [...result, ...(append ? toReplace : [])];
};

/**
 * groups an array into a map of lists by a predicate
 * @param list array to group
 * @param predicate test to find the item
 * @example groupBy([1, 1, 2]) -> { "1": [ 1, 1 ], "2": [ 2 ] }
 */
export const groupBy = <T>(
  list: T[],
  predicate: (i: T) => string = (i: T) => `${i}`
) => {
  return list.reduce((curr, i) => {
    const key = predicate(i);
    const grouping = curr[key] ?? [];
    return { ...curr, [key]: [...grouping, i] };
  }, {} as { [k: string]: T[] });
};

/**
 * filters an array to only have unique items as determined by the predicate function
 * @param list array to filter
 * @param predicate function that groups items
 * @example uniqueBy([1, 1, 1, 2]) -> [1, 2]
 */
export const uniqueBy = <T, T1>(
  arr: T[],
  predicate: (i: T) => T1 = (i: T) => (i as unknown) as T1
) => {
  const seen = new Set<T1>();
  return arr.filter((i) => {
    const val = predicate(i);
    if (!seen.has(val)) {
      seen.add(val);
      return true;
    }
    return false;
  });
};

/**
 * flattens an array by 1 level
 * @param list array to flatten
 * @example flatten([[1], 2]) -> [1, 2]
 */
export const flatten = (arr: any[]): unknown =>
  arr.reduce((a, b) => a.concat(b), []);

/**
 * formats a JS date object as MM/DD/YYYY
 * @param date
 * @returns formatted string
 */
export const formatDay = (date: Date, separator = '/') =>
  dateIsValid(date)
    ? new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })
      .format(date)
      .replace(/\//g, separator)
    : '';

/**
 * formats a JS date object as MM/DD/YYYY HH:MM:SS
 * @param date
 * @returns formatted string
 */
export const formatDateTime = (date: Date) =>
  // typing as any because typescript doesnt accept dateStyle
  dateIsValid(date)
    ? new Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'long'
    } as any).format(date)
    : '';

/**
 * formats a list of JS date objects as  MM/DD/YYYY -  MM/DD/YYYY
 * @param dates
 * @returns formatted string
 */
export const formatDayRange = (dates: Date[]) =>
  dates.map((date) => formatDay(date)).join(' - ');

/**
 * returns if a date object is valid or not
 * @param date
 * @returns boolean
 */
export const dateIsValid = (date: Date) =>
  !Number.isNaN(new Date(date).getTime());

/**
 * returns a string of the date in YYYY/MM/DD
 * @param date
 * @returns formatted string
 */
export const getIsoDay = (date: Date) =>
  dateIsValid(date) ? date.toISOString().split('T')[0] : '';

/**
 * returns a date object of the date in the local timezone, new Date interprets YYYY/MM/DD as UTC
 * @param date string in YYYY/MM/DD format
 * @returns date object
 */
export const parseDateAsLocal = (
  dateStr: string,
  datePattern = /^(\d{4})-(\d{2})-(\d{2})$/
) => {
  const [, year, month, day] = datePattern.exec(dateStr)?.map(Number) ?? [];
  return new Date(year, month - 1, day);
};

/**
 * updates a JS date object based on differences in day, month, and year
 * @param date, difference
 * @returns updated date object
 */
export const updateDate = (
  date: Date,
  difference: { month?: number; year?: number; day?: number }
) => {
  const month = date.getMonth();
  const day = date.getDate();
  const year = date.getFullYear();
  const { month: diffMonth, year: diffYear, day: diffDay } = difference;
  date.setMonth(month + (diffMonth ?? 0));
  date.setFullYear(year + (diffYear ?? 0));
  date.setDate(day + (diffDay ?? 0));
  return date;
};
