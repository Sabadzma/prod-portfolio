interface Arrow12Props {
  fill?: string;
}

const Arrow12: React.FC<Arrow12Props> = ({ fill = "var(--grey1)" }) => {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.5 3.5L8.5 3.5L8.5 8.5"
        stroke={fill}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 3.5L3.5 8.5"
        stroke={fill}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Arrow12;
