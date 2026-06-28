export async function GET() {
  return Response.json({
    status: 'ok',
    message: 'A.K.R Electronics API - Phase 0 Foundation Ready',
    timestamp: new Date().toISOString(),
  });
}
