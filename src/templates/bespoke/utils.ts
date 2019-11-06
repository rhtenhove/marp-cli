type LocationLike = Pick<
  Location,
  'protocol' | 'host' | 'pathname' | 'hash' | 'search'
>
type QuerySetter = (...args: Parameters<History['pushState']>) => void

const replacer: QuerySetter = (...args) => history.replaceState(...args)

export const generateURLfromParams = (
  params: URLSearchParams,
  { protocol, host, pathname, hash }: LocationLike = location
) => {
  const q = params.toString()
  return `${protocol}//${host}${pathname}${q ? '?' : ''}${q}${hash}`
}

export const readQuery = (name: string) =>
  new URLSearchParams(location.search).get(name)

export const popQuery = (name: string) => {
  const value = readQuery(name)
  setQuery({ [name]: undefined })

  return value
}

export const setQuery = (
  queries: Record<string, string | false | null | undefined>,
  opts: { location?: LocationLike; setter?: QuerySetter } = {}
) => {
  const options = { location, setter: replacer, ...opts }
  const params = new URLSearchParams(options.location.search)

  for (const k of Object.keys(queries)) {
    const value = queries[k]

    if (typeof value === 'string') {
      params.set(k, value)
    } else {
      params.delete(k)
    }
  }

  try {
    options.setter(
      null,
      document.title,
      generateURLfromParams(params, options.location)
    )
  } catch (e) {
    // Safari may throw SecurityError by replacing state 100 times per 30 seconds.
    console.error(e)
  }
}
