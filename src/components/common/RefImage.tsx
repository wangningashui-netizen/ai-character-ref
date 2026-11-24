import { useState, type ImgHTMLAttributes, type SyntheticEvent } from 'react'
import { imageFallbackUrl } from '@/lib/recipeImages'

/** 先用传入地址，失败后再试一次原站地址。外观与 img 相同。 */
export function RefImage({ src = '', onError, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [current, setCurrent] = useState(src)
  const [origin, setOrigin] = useState(src)
  const [tried, setTried] = useState(false)
  if (src !== origin) {
    setOrigin(src)
    setCurrent(src)
    setTried(false)
  }

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    if (!tried) {
      const next = imageFallbackUrl(current)
      if (next && next !== current) {
        setTried(true)
        setCurrent(next)
        return
      }
    }
    onError?.(event)
  }

  return <img {...props} src={current} onError={handleError} />
}
