import React from 'react';

type Props = {
  width?: string | number;
  height?: string | number;
  aspectRatio?: string;
  className?: string;
  borderRadius?: string | number;
};

const SkeletonBox: React.FC<Props> = ({
  width = '100%',
  height,
  aspectRatio = '4 / 3',
  className,
  borderRadius = 8,
}) => {
  return (
    <div
      className={`skeleton-box ${className ?? ''}`}
      style={{ width, height, aspectRatio, borderRadius }}
      aria-hidden="true"
    />
  );
};

export default SkeletonBox;
