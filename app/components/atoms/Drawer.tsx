

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    position?: "left" | "right" | "top" | "bottom";
    width?: string; // For left & right drawer
    height?: string; // For top & bottom drawer
    children: React.ReactNode;
}

export default function Drawer({
    isOpen,
    onClose,
    position = "right",
    width = "w-80",
    height = "h-64",
    children,
}: DrawerProps) {
    const positionClasses = {
        left: `left-0 top-0 h-full ${width}`,
        right: `right-0 top-0 h-full ${width}`,
        top: `top-0 left-0 w-full ${height}`,
        bottom: `bottom-0 left-0 w-full ${height}`,
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
                    onClick={onClose}
                />
            )}

            {/* Drawer Content */}
            <div
                className={`fixed ${positionClasses[position]} bg-white shadow-lg p-4 transform transition-transform z-50 
                ${isOpen ? "translate-x-0 translate-y-0" : position === "right" ? "translate-x-full"
                        : position === "left" ? "-translate-x-full"
                            : position === "top" ? "-translate-y-full"
                                : "translate-y-full"}`}
            >
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-2 right-2 p-2 rounded-md hover:bg-slate-200">
                    close
                </button>

                {/* Drawer Content */}
                <div className="mt-6">{children}</div>
            </div>
        </>
    );
}
