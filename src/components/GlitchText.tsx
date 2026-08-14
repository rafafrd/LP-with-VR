export default function GlitchText({ text }: { text: string }) {
  return (
    <span className="glitch-text" data-text={text}>
      {text}
    </span>
  );
}
