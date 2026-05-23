import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildCameraStreamUrl, fetchAlertEnums, fetchAlertPage, sendGripperClose, sendGripperOpen, triggerCameraDetection } from './plcRobotApi'

const fetchMock = vi.fn()

describe('plc robot HTTP API adapter', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    fetchMock.mockReset()
  })

  it('sends a gripper open command without position', async () => {
    vi.stubGlobal('window', { location: { protocol: 'http:' } })
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(createJsonResponse({ success: true, action: 'open', message: 'opened' }))

    await expect(sendGripperOpen()).resolves.toEqual({ success: true, action: 'open', message: 'opened' })

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/gripper/control?action=open')
  })

  it('sends a gripper close command with target position in millimeters', async () => {
    vi.stubGlobal('window', { location: { protocol: 'http:' } })
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(createJsonResponse({ success: true, action: 'close', message: 'closed' }))

    await expect(sendGripperClose(20)).resolves.toEqual({ success: true, action: 'close', message: 'closed' })

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/gripper/control?action=close&position=20')
  })

  it('triggers a single camera detection request', async () => {
    vi.stubGlobal('window', { location: { protocol: 'http:' } })
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(createJsonResponse({
      success: true,
      material: 'orange',
      confidence: 98.7,
      coord_x: 320.4,
      coord_y: 215.6,
      coord_z: 128.3,
      detect_time: '2025-05-20 11:24:30',
      image_base64: '/9j/4AAQ',
    }))

    await expect(triggerCameraDetection()).resolves.toMatchObject({
      success: true,
      material: 'orange',
      confidence: 98.7,
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/camera/detect')
  })

  it('builds a complete camera stream URL without fetching JSON', () => {
    vi.stubGlobal('window', { location: { origin: 'http://localhost:5174', protocol: 'http:' } })

    expect(buildCameraStreamUrl({ fps: 15 })).toBe('http://127.0.0.1:8080/api/v1/camera/stream?fps=15')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('fetches alert enum dictionaries', async () => {
    vi.stubGlobal('window', { location: { protocol: 'http:' } })
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(createJsonResponse({
      alert_types: [{ value: 'camera_timeout', label: 'Camera timeout' }],
      alert_levels: [{ value: 'critical', label: 'Critical' }],
      alert_statuses: [{ value: 'pending', label: 'Pending' }],
    }))

    await expect(fetchAlertEnums()).resolves.toMatchObject({
      alert_types: [{ value: 'camera_timeout', label: 'Camera timeout' }],
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/alert/enums')
  })

  it('fetches a filtered alert page', async () => {
    vi.stubGlobal('window', { location: { protocol: 'http:' } })
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(createJsonResponse({
      total: 1,
      page: 2,
      page_size: 20,
      total_pages: 3,
      items: [],
    }))

    await expect(fetchAlertPage({
      page: 2,
      page_size: 20,
      alert_type: 'bin_capacity_full',
      alert_level: 'warning',
      status: 'pending',
      start_time: '2026-05-11T00:00:00',
      end_time: '2026-05-12T00:00:00',
    })).resolves.toMatchObject({
      page: 2,
      page_size: 20,
      total: 1,
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/alert?page=2&page_size=20&alert_type=bin_capacity_full&alert_level=warning&status=pending&start_time=2026-05-11T00%3A00%3A00&end_time=2026-05-12T00%3A00%3A00')
  })
})

function createJsonResponse(data: unknown): Pick<Response, 'json' | 'ok' | 'status' | 'statusText'> {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => data,
  }
}
