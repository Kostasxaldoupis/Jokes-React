type Props = {
  onFetch: () => void
  onReveal: () => void
  revealed: boolean
  hasJoke: boolean
  loading: boolean
}

function ActionButtons({ onFetch, onReveal, revealed, hasJoke, loading }: Props) {
  return (
    <div className="btns">
      <button
        className="btn-fetch"
        onClick={onFetch}
        disabled={loading}
      >
        {loading ? '► FETCHING...' : '► FETCH JOKE'}
      </button>

      <button
        className="btn-reveal"
        onClick={onReveal}
        disabled={!hasJoke || loading}
      >
        {revealed ? '► HIDE' : '► REVEAL'}
      </button>
    </div>
  )
}

export default ActionButtons