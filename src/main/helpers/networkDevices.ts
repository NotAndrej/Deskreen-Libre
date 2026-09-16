import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import os from 'node:os';

const execFileAsync = promisify(execFile);

/**
 * Looks up the LAN MAC address for an IPv4 via the OS ARP table.
 * Returns an empty string when unknown (off-LAN, VPN, lookup failed).
 */
export default async function getMacForIp(ip: string): Promise<string> {
	if (!ip) return '';
	try {
		if (process.platform === 'linux') {
			const content = await readFile('/proc/net/arp', 'utf-8');
			for (const line of content.split('\n').slice(1)) {
				const parts = line.trim().split(/\s+/);
				if (parts[0] === ip && parts[3] && parts[3] !== '00:00:00:00:00:00') {
					return parts[3].toLowerCase();
				}
			}
			return '';
		}
		if (process.platform === 'darwin') {
			const { stdout } = await execFileAsync('arp', ['-an']);
			const match = stdout
				.split('\n')
				.map((line) => line.match(/\(([^)]+)\)\s+at\s+([0-9a-f:]+)/i))
				.find((m) => m && m[1] === ip);
			return match && match[2] && !match[2].startsWith('ff:') ? match[2].toLowerCase() : '';
		}
		if (process.platform === 'win32') {
			const { stdout } = await execFileAsync('arp', ['-a']);
			const match = stdout
				.split('\n')
				.map((line) =>
					line.trim().match(/^(\d+\.\d+\.\d+\.\d+)\s+([0-9a-f-]+)/i),
				)
				.find((m) => m && m[1] === ip);
			return match ? match[2].replace(/-/g, ':').toLowerCase() : '';
		}
	} catch {
		// ARP lookup is best-effort only
	}
	return '';
}

export function listLanInterfaces(): { name: string; address: string }[] {
	const result: { name: string; address: string }[] = [];
	for (const [name, networks] of Object.entries(os.networkInterfaces())) {
		if (!networks) continue;
		for (const network of networks) {
			if (network.family !== 'IPv4' || network.internal) continue;
			result.push({ name, address: network.address });
		}
	}
	return result;
}
