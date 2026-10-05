async function login(_formData: FormData) {
    "use server";
}

async function signup(_formData: FormData) {
    "use server";
}

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
    const { error, message, next = "" } = await searchParams;

    return (
        <main className="mx-auto max-w-md px-5 py-12">
            <h1 className="font-display text-3xl font-semibold">Log in or sign up</h1>
            <p className="mt-2 text-muted">Save keywords and audits to your account.</p>

            {error && <p className="mt-5 text-bad">{error}</p>}
            {message && <p className="mt-5 text-good">{message}</p>}

            <form className="mt-6 space-y-4">
                <input type="hidden" name="next" value={next} />
                <label className="block">
                    <span className="text-sm font-medium">Email</span>
                    <input
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        className="mt-1 w-full rounded-md border border-line bg-card px-4 py-3"
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-medium">Password</span>
                    <input
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="current-password"
                        className="mt-1 w-full rounded-md border border-line bg-card px-4 py-3"
                    />
                    <span className="text-xs text-muted">At least 8 characters.</span>
                </label>
                <div className="flex gap-3">
                    <button formAction={login} className="rounded-md bg-brand px-6 py-3 font-medium text-onbrand">
                        Log in
                    </button>
                    <button
                        formAction={signup}
                        className="rounded-md border border-line bg-card px-6 py-3 font-medium hover:border-brand"
                    >
                        Sign up
                    </button>
                </div>
            </form>
        </main>
    );
}