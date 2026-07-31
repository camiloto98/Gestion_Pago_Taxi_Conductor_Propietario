const LETTERS = 'TAXICATOR'.split('');

export default function TaxicatorWordmark({ variant = 'nav', showTagline = false }) {
  const isHero = variant === 'hero';

  return (
    <div className={`taxicator-wordmark taxicator-wordmark--${variant}`}>
      <div className="taxicator-wordmark__glow" aria-hidden="true" />
      <div className="taxicator-wordmark__scan" aria-hidden="true" />

      <div className="taxicator-wordmark__text" aria-label="TAXICATOR">
        {LETTERS.map((char, i) => (
          <span
            key={`${char}-${i}`}
            className="taxicator-wordmark__char"
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            {char}
          </span>
        ))}
      </div>

      <div className="taxicator-wordmark__underline" aria-hidden="true">
        <span className="taxicator-wordmark__underline-beam" />
      </div>

      {(isHero || showTagline) && (
        <div className="taxicator-wordmark__tag">
          <span className="taxicator-wordmark__tag-dot" />
          GESTIÓN DE PAGOS TAXI
          <span className="taxicator-wordmark__tag-dot" />
        </div>
      )}
    </div>
  );
}
