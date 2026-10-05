import { type MouseEvent, useRef, useState } from 'react'

import { youtubeEmbedUrl, youtubeWatchUrl } from '../i18n/landing'

interface VideoFacadeProperties {
  videoId: string
  title: string
  playLabel: string
  posterSrc: string
  posterSrcSet: string
  posterSizes: string
  posterWidth: number
  posterHeight: number
}

/**
 * Poster that swaps itself for the YouTube player only after the visitor
 * activates it, so the page contacts no third party before that. Without
 * JavaScript the poster is a plain link to the watch page.
 * @param props - Video id, accessible labels and the local poster image.
 * @param props.videoId - YouTube video id.
 * @param props.title - Accessible title of the player.
 * @param props.playLabel - Accessible name of the play action.
 * @param props.posterSrc - Local poster image URL.
 * @param props.posterSrcSet - Responsive `srcset` of the poster.
 * @param props.posterSizes - `sizes` attribute matching the poster layout.
 * @param props.posterWidth - Poster width in pixels.
 * @param props.posterHeight - Poster height in pixels.
 * @returns The poster link, or the player iframe once activated.
 */
export default function VideoFacade({
  videoId,
  title,
  playLabel,
  posterSrc,
  posterSrcSet,
  posterSizes,
  posterWidth,
  posterHeight,
}: VideoFacadeProperties) {
  const [active, setActive] = useState(false)
  const frameReference = useRef<HTMLIFrameElement>(null)

  function activate(event: MouseEvent<HTMLAnchorElement>) {
    const shouldOpenNatively =
      event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey
    if (shouldOpenNatively) return
    event.preventDefault()
    setActive(true)
    requestAnimationFrame(() => frameReference.current?.focus())
  }

  if (active) {
    return (
      <iframe
        ref={frameReference}
        data-video-player
        src={youtubeEmbedUrl(videoId)}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="aspect-video w-full rounded-2xl border border-border"
      />
    )
  }

  return (
    <a
      data-video-poster
      href={youtubeWatchUrl(videoId)}
      aria-label={`${playLabel}: ${title}`}
      onClick={activate}
      className="group relative block aspect-video w-full overflow-hidden rounded-2xl border border-border outline-hidden focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <img
        src={posterSrc}
        srcSet={posterSrcSet}
        sizes={posterSizes}
        alt=""
        width={posterWidth}
        height={posterHeight}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-16 place-items-center rounded-full bg-primary text-primary-foreground motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover:scale-105 motion-safe:group-active:scale-95">
          <svg
            viewBox="0 0 24 24"
            className="size-7 translate-x-px fill-current"
            aria-hidden="true"
          >
            <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
          </svg>
        </span>
      </span>
    </a>
  )
}
