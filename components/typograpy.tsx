import { typographyProps } from "@/lib/type";
import { cn } from "@/lib/utils";

export const H1 = ({ className, children }: typographyProps) => {
  return (
    <h1
      className={cn(
        className,
        "font-montserrat text-2xl md:text-5xl leading-relaxed"
      )}
    >
      {children}
    </h1>
  );
};

export const H2 = ({ className, children }: typographyProps) => {
  return (
    <h2
      className={cn(
        className,
        "font-montserrat text-xl md:text-4xl leading-relaxed"
      )}
    >
      {children}
    </h2>
  );
};

export const H3 = ({ className, children }: typographyProps) => {
  return (
    <h3
      className={cn(
        className,
        "font-montserrat text-lg md:text-2xl leading-relaxed"
      )}
    >
      {children}
    </h3>
  );
};

export const P = ({ className, children }: typographyProps) => {
  return (
    <p
      className={cn(
        className,
        "font-montserrat text-sm md:text-base leading-normal"
      )}
    >
      {children}
    </p>
  );
};

export const Ul = ({ className, children }: typographyProps) => {
  return (
    <ul
      className={cn(
        className,
        "font-montserrat list-disc list-inside text-sm md:text-base leading-normal space-y-2"
      )}
    >
      {children}
    </ul>
  );
};

export const Ol = ({ className, children }: typographyProps) => {
  return (
    <ol
      className={cn(
        className,
        "font-montserrat list-decimal list-inside text-sm md:text-base leading-normal space-y-2"
      )}
    >
      {children}
    </ol>
  );
};
