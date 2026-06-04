import { useState, useEffect } from 'react'

type Props = {
  theme: 'teletext' | 'terminal'
  count: number
  footer?: boolean
}

function Header({ theme, count, footer = false }: Props) {
  const [time, setTime] = useState('')

  useEffect(() => {
    function tick() {
      const t = new Date()
      const fmt = (x: number) => String(x).padStart(2, '0')
      setTime([t.getHours(), t.getMinutes(), t.getSeconds()].map(fmt).join(':'))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)  // cleanup on unmount
  }, [])

  if (theme === 'terminal') {
    if (footer) {
      return (
        <div className="tm-stats">
          <span>FETCHED <b>{count}</b></span>
          <span>STATUS <b>READY</b></span>
        </div>
      )
    }
    return (
      <div className="tm-topbar">
        <div className="tm-logo">JOKE<span>CTL</span></div>
        <div className="tm-meta">v1.0.0<br />{time}</div>
      </div>
    )
  }

  if (footer) {
    return (
      <div className="tt-footer">
        <span>400 JOKES</span>
        <span className="hint">401 NEXT · 402 ABOUT</span>
        <span>{count} FETCHED</span>
      </div>
    )
  }

  return (
    <>
      <div className="tt-topbar">
        <span className="t-title">JOKETEXT</span>
        <span>P400</span>
        <span className="t-clock">{time}</span>
      </div>
      <div className="stripe">
        {['#f00','#0f0','#ff0','#00f','#f0f','#0ff','#fff'].map(c => (
          <span key={c} style={{ background: c }} />
        ))}
      </div>
      <div className="tt-subbar">
        <span>JOKES &amp; HUMOUR SERVICE</span>
        <span>{count > 0 ? `JOKES: ${count}` : ''}</span>
      </div>
    </>
  )
}

export default Header