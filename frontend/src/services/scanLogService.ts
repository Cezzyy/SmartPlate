// src/services/scanLogService.ts
import axios from 'axios'

// Normalized scan_log shape
export interface ScanLog {
  log_id: string
  plate_id: string | null
  registration_id: string | null
  lto_client_id: string      // guaranteed non-empty
  scanned_at: string
}

// User data as returned by the detail endpoint
export interface UserRecord {
  email: string
  first_name: string
  last_name: string
  lto_client_id: string
  address: {
    barangay: string
    city_municipality: string
    house_no: string
    province: string
    street: string
    zip_code: string
  }
  contact: {
    mobile_number: string
    telephone_number: string
  }
}

// Combined record type
export interface ScanLogRecord {
  scan_log: ScanLog
  user: UserRecord
}

// Helper to unwrap the Go `{ String, Valid }` wrapper
function unwrap(field: any): string | null {
  return field?.Valid ? field.String : null
}

/**
 * Fetch scan logs from the backend, unwrap & normalize,
 * and drop any record without a valid LTO Client ID.
 */
export async function getAllScanLogs(
  page = 1,
  limit = 1000
): Promise<ScanLogRecord[]> {
  const resp = await axios.get('/api/scan-log', {
    params: { page, limit }
  })

  // Backend returns { items: [ ... ] }
  const items: any[] = Array.isArray(resp.data.items) ? resp.data.items : []

  return items
    .map(item => {
      const scan: ScanLog = {
        log_id:          item.log_id,
        plate_id:        unwrap(item.plate_id),
        registration_id: unwrap(item.registration_id),
        lto_client_id:   unwrap(item.lto_client_id) || '',  // will filter out if empty
        scanned_at:      item.scanned_at,
      }
      return {
        scan_log: scan,
        user: item.user as UserRecord
      }
    })
    .filter(rec => rec.scan_log.lto_client_id !== '')
}

/**
 * Subscribe to live scan-log events over WebSocket.
 * Only delivers records with a valid LTO Client ID.
 */
export function subscribeLiveScanLogs(
  onMessage: (record: ScanLogRecord) => void,
  onError?: (err: Event) => void
): () => void {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const wsUrl = `${protocol}://${window.location.host}/ws/scan`
  const socket = new WebSocket(wsUrl)

  socket.addEventListener('message', event => {
    try {
      const raw = JSON.parse(event.data) as any

      const scan: ScanLog = {
        log_id:          raw.scan_log.log_id,
        plate_id:        unwrap(raw.scan_log.plate_id),
        registration_id: unwrap(raw.scan_log.registration_id),
        lto_client_id:   unwrap(raw.scan_log.lto_client_id) || '',
        scanned_at:      raw.scan_log.scanned_at,
      }

      if (scan.lto_client_id) {
        onMessage({
          scan_log: scan,
          user: raw.user as UserRecord
        })
      }
    } catch (e) {
      console.error('Failed to parse WS scan-log message', e)
      onError?.(e as any)
    }
  })

  socket.addEventListener('error', onError ?? (e => console.error('WebSocket error', e)))

  // Return unsubscribe/cleanup function
  return () => {
    socket.close()
  }
}
