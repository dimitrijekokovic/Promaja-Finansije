export async function GET() {
  return Response.json({
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    envKeys: Object.keys(process.env).filter(
      (k) =>
        k.includes("DATABASE") ||
        k.includes("POSTGRES") ||
        k.includes("PRISMA"),
    ),
  });
}
