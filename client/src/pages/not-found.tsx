export default function NotFound() {
  return (
    <div className="page">
      <div className="profile">
        <h1 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--grey1)' }}>
          404 - Page Not Found
        </h1>
        <p style={{ color: 'var(--grey2)' }}>
          The page you're looking for doesn't exist.
        </p>
      </div>
    </div>
  );
}
