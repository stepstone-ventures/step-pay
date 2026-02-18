import * as React from "react"

export const getStrictContext = <T>(name: string) => {
  const Context = React.createContext<T | undefined>(undefined)

  const useStrictContext = () => {
    const value = React.useContext(Context)
    if (value === undefined) {
      throw new Error(`${name} is missing its provider`)
    }
    return value
  }

  return [Context.Provider, useStrictContext] as const
}
