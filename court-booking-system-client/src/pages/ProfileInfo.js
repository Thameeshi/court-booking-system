import { useSelector } from "react-redux";

const ProfileInfo = () => {
  const userDetails = useSelector((state) => state.user.userDetails);

  if (!userDetails) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 18,
          color: "#555",
        }}
      >
        No user details found.
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "rgba(14, 99, 4, 0.1)", // soft transparent green
        padding: 40,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily:
          "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)", // near white with slight transparency
          borderRadius: 20,
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.1)",
          maxWidth: 900,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          overflow: "hidden",
        }}
      >
        {/* Left side: SVG Avatar */}
        <div
          style={{
            backgroundColor: "rgba(14, 99, 4, 0.15)", // light green overlay
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 40,
          }}
          aria-hidden="true"
        >
          <svg
            width="140"
            height="140"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0e6304"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="7" r="4" />
            <path d="M5.5 21a7 7 0 0 1 13 0" />
          </svg>
        </div>

        {/* Right side: Profile info */}
        <div style={{ padding: "40px 60px", color: "#0e6304" }}>
          <h1
            style={{
              marginBottom: 24,
              fontWeight: "700",
              fontSize: "2.8rem",
              letterSpacing: "1px",
            }}
          >
            My Profile
          </h1>

          <section
            style={{
              marginBottom: 40,
              borderBottom: "2px solid rgba(14, 99, 4, 0.3)",
              paddingBottom: 20,
            }}
          >
            <h2
              style={{
                fontSize: "1.8rem",
                marginBottom: 18,
                fontWeight: "600",
              }}
            >
              Profile Information
            </h2>

            <dl style={{ fontSize: 18, lineHeight: 1.6 }}>
              <dt style={{ fontWeight: "700" }}>Name:</dt>
              <dd style={{ marginBottom: 12 }}>{userDetails.Name}</dd>

              <dt style={{ fontWeight: "700" }}>Email:</dt>
              <dd style={{ marginBottom: 12 }}>{userDetails.Email}</dd>

              <dt style={{ fontWeight: "700" }}>Role:</dt>
              <dd style={{ marginBottom: 12 }}>{userDetails.UserRole}</dd>

              <dt style={{ fontWeight: "700" }}>XRPL Address:</dt>
              <dd>{userDetails.XrplAddress}</dd>
            </dl>
          </section>

          <section>
            <h3
              style={{
                fontSize: "1.6rem",
                marginBottom: 20,
                fontWeight: "600",
                borderBottom: "2px solid rgba(14, 99, 4, 0.3)",
                paddingBottom: 10,
              }}
            >
              Fund Your XRPL Account
            </h3>

            <a
              href={`https://test.xrplexplorer.com/en/faucet?address=${userDetails.XrplAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                backgroundColor: "#850c0cff",
                color: "#fff",
                padding: "14px 32px",
                borderRadius: 12,
                fontWeight: "600",
                fontSize: 18,
                textDecoration: "none",
                transition: "background-color 0.3s ease",
                boxShadow:
                  "0 6px 12px rgba(103, 97, 97, 0.72)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#850c0cff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#850c0cff")
              }
            >
              Fund Account
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
