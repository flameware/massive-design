import { createContext } from "react"

/** 필드 이름 → 서버 오류 문자열(들). Form이 내리고 Field가 읽는다 */
export type FormErrors = Record<string, string | string[]>

export const FormErrorsContext = createContext<FormErrors | undefined>(undefined)
