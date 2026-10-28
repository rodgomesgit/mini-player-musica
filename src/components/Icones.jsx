function Svg({ children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="20"
      height="20"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function IconePlay(props) {
  return (
    <Svg {...props}>
      <path d="M8 5.14v13.72c0 .84.9 1.37 1.63.96l11.5-6.86a1.1 1.1 0 0 0 0-1.92L9.63 4.18A1.1 1.1 0 0 0 8 5.14Z" />
    </Svg>
  )
}

export function IconePause(props) {
  return (
    <Svg {...props}>
      <path d="M7 4.5h3v15H7v-15Zm7 0h3v15h-3v-15Z" />
    </Svg>
  )
}

export function IconeProxima(props) {
  return (
    <Svg {...props}>
      <path d="M6 5.5c0-.9 1-1.42 1.72-.9l9.5 6.5a1.1 1.1 0 0 1 0 1.8l-9.5 6.5c-.72.52-1.72 0-1.72-.9v-13Z" />
      <rect x="17" y="5" width="2" height="14" rx="0.5" />
    </Svg>
  )
}

export function IconeAnterior(props) {
  return (
    <Svg {...props}>
      <path d="M18 5.5c0-.9-1-1.42-1.72-.9l-9.5 6.5a1.1 1.1 0 0 0 0 1.8l9.5 6.5c.72.52 1.72 0 1.72-.9v-13Z" />
      <rect x="5" y="5" width="2" height="14" rx="0.5" />
    </Svg>
  )
}

export function IconeEmbaralhar(props) {
  return (
    <Svg {...props}>
      <path d="M3 6h3.2c1 0 1.9.5 2.44 1.33L15 17.67A3 3 0 0 0 17.44 19H21v-2h-3.56a1 1 0 0 1-.82-.44l-1.5-2.3 1.5-2.3a1 1 0 0 1 .82-.44H21V9.5h-3.56a3 3 0 0 0-2.44 1.26l-1.5 2.3-1.5-2.3L9.56 8.4a1 1 0 0 1-.82-.4H3V6Z" />
      <path d="m21 5-3-2v1.5h-.5A3.5 3.5 0 0 0 14.8 6l-.7 1.08 1.2 1.84.9-1.38A1.5 1.5 0 0 1 17.5 6.5h.5V8l3-2Zm0 10-3 2v-1.5h-.5a1.5 1.5 0 0 1-1.26-.68l-.9-1.38-1.2 1.84.7 1.08a3.5 3.5 0 0 0 2.96 1.64h.2V19l3-2Z" />
    </Svg>
  )
}

export function IconeRepetir(props) {
  return (
    <Svg {...props}>
      <path d="M7 7h9a3 3 0 0 1 3 3v1h-2v-1a1 1 0 0 0-1-1H7v2.5L3.5 8 7 4.5V7Z" />
      <path d="M17 17H8a3 3 0 0 1-3-3v-1h2v1a1 1 0 0 0 1 1h9v-2.5l3.5 3.5-3.5 3.5V17Z" />
    </Svg>
  )
}

export function IconeVolume(props) {
  return (
    <Svg {...props}>
      <path d="M4 9.5v5a.5.5 0 0 0 .5.5H8l5 4V5L8 9H4.5a.5.5 0 0 0-.5.5Z" />
      <path d="M16.5 8a5 5 0 0 1 0 8l-1.1-1.1a3.5 3.5 0 0 0 0-5.8L16.5 8Z" />
      <path d="M18.8 5.7a8.5 8.5 0 0 1 0 12.6l-1.1-1.2a7 7 0 0 0 0-10.2l1.1-1.2Z" />
    </Svg>
  )
}

export function IconeVolumeMudo(props) {
  return (
    <Svg {...props}>
      <path d="M4 9.5v5a.5.5 0 0 0 .5.5H8l5 4V5L8 9H4.5a.5.5 0 0 0-.5.5Z" />
      <path d="m15.5 9.5 5 5m0-5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </Svg>
  )
}

export function IconeMusica(props) {
  return (
    <Svg {...props}>
      <path d="M9 18a3 3 0 1 1-2-2.83V5.5a1 1 0 0 1 .78-.98l9-2A1 1 0 0 1 18 3.5v9.67a3 3 0 1 1-2-2.83V7.1l-7 1.56V18Z" />
    </Svg>
  )
}

export function IconeOndaSonora(props) {
  return (
    <Svg {...props}>
      <rect x="5" y="10" width="2.4" height="4" rx="1" />
      <rect x="9" y="6" width="2.4" height="12" rx="1" />
      <rect x="13" y="9" width="2.4" height="6" rx="1" />
      <rect x="17" y="4" width="2.4" height="16" rx="1" />
    </Svg>
  )
}
