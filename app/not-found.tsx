export default function NotFound() {
  return (
    <html>
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 'bold' }}>404</h1>
          <p style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Página Não Encontrada</p>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            A página que você está procurando não existe.
          </p>
          <a href="/" style={{ marginTop: '1.5rem', padding: '0.5rem 1rem', backgroundColor: '#0070f3', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Voltar para a Home
          </a>
        </div>
      </body>
    </html>
  );
}