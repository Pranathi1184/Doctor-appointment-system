import React from "react";

function Svg({ children, size = 18, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export const IconStethoscope = (props) => (
  <Svg {...props}>
    <path d="M7 2a1 1 0 0 1 1 1v5a4 4 0 1 0 8 0V3a1 1 0 1 1 2 0v5a6 6 0 0 1-5 5.91V17a3 3 0 1 0 6 0v-1.1a3 3 0 1 1 2 0V17a5 5 0 1 1-10 0v-3.09A6 6 0 0 1 6 8V3a1 1 0 0 1 1-1Zm14 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
  </Svg>
);

export const IconUsers = (props) => (
  <Svg {...props}>
    <path d="M16 11c1.66 0 3-1.57 3-3.5S17.66 4 16 4s-3 1.57-3 3.5S14.34 11 16 11Zm-8 0c1.66 0 3-1.57 3-3.5S9.66 4 8 4 5 5.57 5 7.5 6.34 11 8 11Zm0 2c-2.67 0-8 1.34-8 4v1h10v-1c0-1.03.39-1.98 1.05-2.8C10.5 13.54 9.14 13 8 13Zm8 0c-.64 0-1.36.08-2.1.23C14.59 14.2 15 15.14 15 16v2h9v-1C24 14.34 18.67 13 16 13Z" />
  </Svg>
);

export const IconCalendar = (props) => (
  <Svg {...props}>
    <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 9H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9ZM5 6a1 1 0 0 0-1 1v2h16V7a1 1 0 0 0-1-1H5Z" />
  </Svg>
);

export const IconEdit = (props) => (
  <Svg {...props}>
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm18-11.5a1 1 0 0 0 0-1.41l-1.34-1.34a1 1 0 0 0-1.41 0l-1.13 1.13 3.75 3.75L21 5.75Z" />
  </Svg>
);

export const IconTrash = (props) => (
  <Svg {...props}>
    <path d="M6 7h12l-1 14H7L6 7Zm3-3h6l1 2H8l1-2Zm-4 2h14v2H5V6Z" />
  </Svg>
);

