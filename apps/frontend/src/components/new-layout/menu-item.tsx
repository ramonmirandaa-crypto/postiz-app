'use client';
import { FC, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import Link from 'next/link';

export const MenuItem: FC<{ label: string; icon: ReactNode; path: string; onClick?: () => void }> = ({
  label,
  icon,
  path,
  onClick,
}) => {
  const currentPath = usePathname();
  const isActive = currentPath.indexOf(path) === 0;

  const className = clsx(
    'relative w-full minCustom:h-[56px] custom:h-[32px] py-[8px] px-[6px] gap-[5px] flex flex-col custom:flex-row text-[10px] font-[700] items-center minCustom:justify-center rounded-[12px] transition-all duration-150 hover:text-textItemFocused hover:bg-boxFocused hover:shadow-menu',
    isActive
      ? 'text-textItemFocused bg-boxFocused shadow-menu'
      : 'text-textItemBlur'
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        <div className="custom:hidden">{icon}</div>
        <div className="text-[10px]">{label}</div>
      </button>
    );
  }

  return (
    <Link
      prefetch={true}
      href={path}
      {...path.indexOf('http') === 0 && { target: '_blank' }}
      className={className}
    >
      <div className="custom:hidden">{icon}</div>
      <div className="text-[10px]">{label}</div>
    </Link>
  );
};
