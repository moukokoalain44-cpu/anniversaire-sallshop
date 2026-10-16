import { useEffect } from 'react'

export function useEditorialMotion() {
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let cleanup = () => {}
    const setup = () => {
      cleanup()
      if (media.matches) return
      const sections = document.querySelectorAll<HTMLElement>('main section')
      const observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed')
              observer.unobserve(entry.target)
            }
          }),
        { threshold: 0.06 },
      )
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top > window.innerHeight) {
          section.classList.add('motion-section', 'motion-pending')
          observer.observe(section)
        }
      })
      const photos = document.querySelectorAll<HTMLElement>('[data-parallax]')
      let frame = 0
      const paint = () => {
        photos.forEach((photo) => {
          const rect = photo.getBoundingClientRect()
          if (rect.bottom > 0 && rect.top < window.innerHeight) {
            const progress =
              (rect.top + rect.height / 2 - window.innerHeight / 2) /
              window.innerHeight
            photo.style.setProperty(
              '--parallax-y',
              `${Math.max(-28, Math.min(28, progress * -45))}px`,
            )
          }
        })
        frame = 0
      }
      const scroll = () => {
        if (!frame) frame = requestAnimationFrame(paint)
      }
      window.addEventListener('scroll', scroll, { passive: true })
      window.addEventListener('resize', scroll)
      paint()
      cleanup = () => {
        observer.disconnect()
        window.removeEventListener('scroll', scroll)
        window.removeEventListener('resize', scroll)
        cancelAnimationFrame(frame)
        sections.forEach((section) =>
          section.classList.remove('motion-pending'),
        )
        photos.forEach((photo) => photo.style.removeProperty('--parallax-y'))
      }
    }
    setup()
    media.addEventListener('change', setup)
    return () => {
      cleanup()
      media.removeEventListener('change', setup)
    }
  }, [])
}

export function StorePhoto({
  file,
  alt,
  caption,
  className = '',
}: {
  file: string
  alt: string
  caption: string
  className?: string
}) {
  return (
    <figure className={`store-photo ${className}`}>
      <div className="store-photo-window" data-parallax>
        <img
          src={`/img/${file}.png`}
          alt={alt}
          loading="lazy"
        />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}
