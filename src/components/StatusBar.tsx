import { Fragment } from "react";

const STATUS_ITEMS = [
  "SYSTEM STATUS: ONLINE",
  "WEBXR READY",
  "FALLBACK 3D ATIVO",
  "SEM APP",
  "SEM ATRITO",
  "BUILD 0.1.0",
] as const;

export default function StatusBar() {
  return (
    <div className="statusbar" role="presentation" aria-hidden="true">
      <div className="statusbar__track">
        {Array.from({ length: 2 }).flatMap((_, seq) =>
          STATUS_ITEMS.map((item, i) => (
            <Fragment key={`${seq}-${i}`}>
              <span>{item}</span>
              <span aria-hidden="true">·</span>
            </Fragment>
          ))
        )}
      </div>
    </div>
  );
}
