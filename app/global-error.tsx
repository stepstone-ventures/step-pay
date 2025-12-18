"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "1rem",
          fontFamily: "system-ui, sans-serif"
        }}>
          <div style={{
            maxWidth: "500px",
            padding: "2rem",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
            textAlign: "center"
          }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
              Something went wrong!
            </h1>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
              {error.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={reset}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#0075EB",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "500"
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}


