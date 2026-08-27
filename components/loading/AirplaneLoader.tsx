"use client";

/**
 * AirplaneLoader — animated airplane with clouds and speed lines.
 * Adapted from Uiverse.io by anand_4957.
 * Pure CSS animation, theme-aware via CSS custom properties.
 */
export function AirplaneLoader() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Clouds */}
      <div className="airplane-clouds">
        <div className="airplane-cloud airplane-cloud-1" />
        <div className="airplane-cloud airplane-cloud-2" />
        <div className="airplane-cloud airplane-cloud-3" />
        <div className="airplane-cloud airplane-cloud-4" />
        <div className="airplane-cloud airplane-cloud-5" />
      </div>

      {/* Speed lines */}
      <div className="airplane-longfazers">
        <span className="airplane-lf airplane-lf-1" />
        <span className="airplane-lf airplane-lf-2" />
        <span className="airplane-lf airplane-lf-3" />
        <span className="airplane-lf airplane-lf-4" />
      </div>

      {/* Airplane */}
      <div className="airplane-loader">
        {/* Fuselage */}
        <span className="airplane-fuselage">
          <span className="airplane-fazer airplane-fazer-1" />
          <span className="airplane-fazer airplane-fazer-2" />
          <span className="airplane-fazer airplane-fazer-3" />
          <span className="airplane-fazer airplane-fazer-4" />
        </span>

        {/* Body */}
        <div className="airplane-body">
          <span className="airplane-body-triangle" />
          <div className="airplane-body-head" />
          <div className="airplane-body-tail" />
        </div>

        {/* Face / cockpit */}
        <div className="airplane-face">
          <div className="airplane-face-accent" />
        </div>
      </div>
    </div>
  );
}
