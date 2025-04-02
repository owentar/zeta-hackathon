export const TakePhoto: React.FC<{
  className?: string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ className, onClick, disabled }) => {
  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      <svg
        width="112"
        height="112"
        viewBox="0 0 112 112"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="5"
          y="5"
          width="102"
          height="102"
          rx="51"
          stroke="white"
          stroke-opacity="0.1"
          stroke-width="10"
        />
        <rect x="10" y="10" width="92" height="92" rx="46" fill="#C4594F" />
        <path
          d="M41 51C41 49.1591 42.4924 47.6667 44.3333 47.6667H45.8827C46.9972 47.6667 48.038 47.1097 48.6562 46.1824L50.0104 44.151C50.6287 43.2237 51.6694 42.6667 52.7839 42.6667H59.2161C60.3306 42.6667 61.3713 43.2237 61.9896 44.151L63.3438 46.1824C63.962 47.1097 65.0028 47.6667 66.1173 47.6667H67.6667C69.5076 47.6667 71 49.1591 71 51V66C71 67.841 69.5076 69.3334 67.6667 69.3334H44.3333C42.4924 69.3334 41 67.841 41 66V51Z"
          stroke="white"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M61 57.6667C61 60.4281 58.7614 62.6667 56 62.6667C53.2386 62.6667 51 60.4281 51 57.6667C51 54.9053 53.2386 52.6667 56 52.6667C58.7614 52.6667 61 54.9053 61 57.6667Z"
          stroke="white"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  );
};
