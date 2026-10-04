"use client";

export default function ThemeToggle() {
    function toggle() {
        const root = document.documentElement;
        const next = root.dataset.theme === "dark" ? "light" : "dark";
        root.dataset.theme = next;
        try {
            localStorage.setItem("theme", next);
        } catch { }
    }

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
            className="theme-switch"
        >
            <span className="knob" />
        </button>
    );
}