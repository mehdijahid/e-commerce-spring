import './StarRating.css'

interface StarRatingProps {
  value: number
  count?: number
  onChange?: (rating: number) => void
  size?: 'sm' | 'md'
  showCount?: boolean
  disabled?: boolean
}

export default function StarRating({
  value,
  count = 0,
  onChange,
  size = 'md',
  showCount = true,
  disabled = false,
}: StarRatingProps) {
  const interactive = Boolean(onChange) && !disabled
  const numericValue = Number.isFinite(Number(value)) ? Number(value) : 0
  const filled = Math.round(Math.max(0, Math.min(5, numericValue)))

  return (
    <div className={`star-rating star-rating-${size}`}>
      <div className="star-rating-stars" role={interactive ? 'radiogroup' : undefined}>
        {[1, 2, 3, 4, 5].map((i) => {
          const active = i <= filled
          const star = (
            <svg
              viewBox="0 0 24 24"
              width={size === 'sm' ? 14 : 17}
              height={size === 'sm' ? 14 : 17}
              className={`star-rating-star${active ? ' star-rating-star-filled' : ''}`}
              fill={active ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7L5.8 21l1.6-7L2 9.2l7.1-.6L12 2z" />
            </svg>
          )
          if (!interactive) {
            return <span key={i}>{star}</span>
          }
          return (
            <span
              key={i}
              role="radio"
              aria-checked={i === filled}
              aria-label={`${i} étoile${i > 1 ? 's' : ''}`}
              className="star-rating-btn"
              tabIndex={i === 1 ? 0 : -1}
              onClick={(e) => {
                e.stopPropagation()
                onChange?.(i)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange?.(i)
                }
              }}
            >
              {star}
            </span>
          )
        })}
      </div>
      {showCount && count > 0 && (
        <span className="star-rating-text">
          {value.toFixed(1).replace('.', ',')} ({count})
        </span>
      )}
      {showCount && count === 0 && <span className="star-rating-text star-rating-text-empty">Aucune note</span>}
    </div>
  )
}
