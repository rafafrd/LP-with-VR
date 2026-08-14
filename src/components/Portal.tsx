export default function Portal() {
  return (
    <div
      className="portal"
      role="img"
      aria-label="Ilustração de um portal 3D girando, representando a experiência WebXR"
    >
      <div className="portal__ring portal__ring--1" />
      <div className="portal__ring portal__ring--2" />
      <div className="portal__ring portal__ring--3" />
      <div className="portal__core" />
    </div>
  );
}
