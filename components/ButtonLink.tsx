/**
 * ButtonLink — a reusable styled link component.
 * Used for call-to-action links across pages.
 */

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  wrapperClassName?: string;
  linkClassName?: string;
}

export function ButtonLink({
  href,
  children,
  external,
  wrapperClassName,
  linkClassName,
}: ButtonLinkProps) {
  const link = (
    <a
      href={href}
      {...(linkClassName ? { className: linkClassName } : {})}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </a>
  );

  if (wrapperClassName) {
    return <div className={wrapperClassName}>{link}</div>;
  }

  return link;
}
