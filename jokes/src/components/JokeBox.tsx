type Joke = {
  setup: string
  punchline: string
  type: string
  id: number
  source: string
}

type Props = {
  joke: Joke | null
  loading: boolean
  theme: 'teletext' | 'terminal'
}

function JokeBox({ joke, loading, theme }: Props) {
  return (
    <div className="joke-box">
      <div className="box-label">► SETUP</div>

      {joke && (
        <div className="tags">
          <span className="type-tag">{joke.type.toUpperCase()}</span>
          <span className="type-tag source">
            {joke.source === 'jokeapiv2' ? 'JOKEAPI V2' : 'OFFICIAL API'}
          </span>
        </div>
      )}

      <div className="setup-text">
        {loading && (
          <span style={{ color: 'var(--dim)' }}>
            PLEASE WAIT{theme === 'teletext' ? '█' : '...'}
          </span>
        )}
        {!loading && !joke && (
          <>
            PRESS <span style={{ color: 'var(--accent)' }}>FETCH JOKE</span> TO BEGIN
            {theme === 'teletext' && <span className="blink">█</span>}
          </>
        )}
        {!loading && joke && joke.setup}
      </div>
    </div>
  )
}

export default JokeBox