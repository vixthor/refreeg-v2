import { typographyProps } from "@/lib/type";
import { cn } from "@/lib/utils";



export const H1 = ({ className, children }: typographyProps) => {
    return (
        <h1 className={cn(className,'text-2xl md:text-5xl leading-relaxed')}>{children}</h1>
    )
}
export const H2 = ({ className, children }: typographyProps) => {
    return (
        <h2 className={cn(className,'text-xl md:text-4xl leading-relaxed')}>{children}</h2>
    )
}
export const H3 = ({ className, children }: typographyProps) => {
    return (
        <h2 className={cn(className,'text-lg md:text-2xl leading-relaxed')}>{children}</h2>
    )
}

export const P = ({ className, children, }: typographyProps) => {
    return (
        <p className={cn(className,'text-sm md:text-base leading-normal')}>{children}</p>
    )

}

export const Ul = ({ className, children }: typographyProps) => {
    return (
      <ul className={cn(className, "list-disc list-inside text-sm md:text-base leading-normal space-y-2")}>
        {children}
      </ul>
    );
  };
  
export const Ol = ({ className, children }: typographyProps) => {
    return (
      <ol className={cn(className, "list-decimal list-inside text-sm md:text-base leading-normal space-y-2")}>
        {children}
      </ol>
    );
  };