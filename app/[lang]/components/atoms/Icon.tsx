import React from "react";
import Image from "./Image";

type IconProps = {
    src: string;
    alt?: string;
    className?: string;
};

export const Icon: React.FC<IconProps> = ({
    src,
    alt = "icon",
    className = "w-6 h-6",
}) => {
    return (
        <Image
            src={src}
            alt={alt}
            className={className}
            width={24}
            height={24}
        />
    );
};
