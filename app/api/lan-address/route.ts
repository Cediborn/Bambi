import { networkInterfaces } from "node:os";
import { NextResponse } from "next/server";

/** Adapter families a phone is most likely to reach, in preference order. */
const PREFERRED = [/^192\.168\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./];

/**
 * Reports this computer's LAN address (e.g. http://192.168.1.23:3000) so the
 * user can open the app on a phone on the same Wi-Fi. Picks the first
 * non-internal IPv4, preferring common home-router subnets.
 */
export function GET() {
  const port = process.env.PORT ?? "3000";
  const ips: string[] = [];
  for (const list of Object.values(networkInterfaces())) {
    for (const net of list ?? []) {
      if (net.family !== "IPv4" || net.internal) continue;
      ips.push(net.address);
    }
  }
  if (ips.length === 0) {
    return NextResponse.json({ url: null }, { status: 404 });
  }
  const pick = ips.find((ip) => PREFERRED.some((re) => re.test(ip))) ?? ips[0];
  return NextResponse.json({ url: `http://${pick}:${port}` });
}
