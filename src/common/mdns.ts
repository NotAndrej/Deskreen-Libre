/** mDNS hostname advertised for quick viewer access on the local network,
 * e.g. http://deskreen-libre.local:3131/<room>. The QR code keeps using the
 * LAN IP (reliable everywhere, including Android which can't resolve .local),
 * while this name is shown as a memorable alternative. */
export const MDNS_HOSTNAME = 'deskreen-libre.local';

export const MDNS_SERVICE_NAME = 'Deskreen Libre';
