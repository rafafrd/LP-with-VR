import { Fragment } from "react";

const TELEMETRY_ITEMS = [
  "VOID SPATIAL OPTICS",
  "100% LOCAL ON-DEVICE NEURAL ENGINE",
  "ZERO DADOS TRANSMITIDOS · LGPD COMPLIANT",
  "MEDIA VISION WASM & SIMD",
  "LATÊNCIA MÍNIMA: ~12MS",
  "CALIBRAÇÃO ANATÔMICA 468 PTS",
  "METROPOLITAN EDITION",
] as const;

export default function StatusBar() {
  return (
    <aside className="statusbar" aria-label="Status do sistema e telemetria óptica">
      <div className="statusbar__track">
        {Array.from({ length: 2 }).flatMap((_, seq) =>
          TELEMETRY_ITEMS.map((item, i) => (
            <Fragment key={`${seq}-${i}`}>
              <span className="statusbar__item">
                <span className="statusbar__dot" aria-hidden="true" />
                {item}
              </span>
              <span className="statusbar__sep" aria-hidden="true">
                /
              </span>
            </Fragment>
          ))
        )}
      </div>
    </aside>
  );
}
